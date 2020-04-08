"""
@TODO (not listed elsewhere in the code):
    - create list of possible values for the various area "types" - check against
    - add try/except for connecting to database
    - for get_crash(), figure out how to return 400 if <id> not provided
"""

import calendar
from typing import Dict

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
import psycopg2 

from config import PSQL_CREDS


class crashResponse(BaseModel):
    month: str
    year: int
    vehicle_count: int
    bicycle_count: int
    bicycle_fatalities: int
    ped_count: int
    ped_fatalities: int
    vehicle_occupants: int
    collision_type: str 
    

class severityResponse(BaseModel):
    fatal: int
    major: int
    moderate: int
    minor: int
    unknown_severity: int = Field(..., alias="unknown severity")
    uninjured: int
    unknown_if_injured: int = Field(..., alias="unknown if injured")


class modeResponse(BaseModel):
    bike: int
    ped: int
    vehicle_occupants: int = Field(..., alias="vehicle occupants")


class yearResponse(BaseModel):
    total_crashes: int = Field(..., alias="total crashes")
    severity: severityResponse
    mode: modeResponse
    type: dict


class summaryResponse(BaseModel):
    str: yearResponse


app = FastAPI(docs_url="/api/crash-data/v1/docs", redoc_url=None)


def get_db_cursor():
    connection = psycopg2.connect(PSQL_CREDS)
    return connection.cursor()


@app.get('/api/crash-data/v1/crashes/{id}', response_model=crashResponse)
def get_crash(id: str):
    '''Get information about an individual crash.'''
    cursor = get_db_cursor()
    query = """
        SELECT
            month,
            year,
            vehicles,
            bicyclists,
            bike_fatalities,
            pedestrians,
            ped_fatalities,
            persons,
            collision_type
        FROM crash
        WHERE id = %s 
        """

    try:    
        cursor.execute(query, [id])
    except psycopg2.Error as e:
        raise HTTPException(status_code=400, detail='Database error: ' + str(e))
        
    result = cursor.fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail='Crash not found')
    
    crash = {
        'month': calendar.month_name[result[0]],
        'year': result[1],
        'vehicle_count': result[2],
        'bicycle_count': result[3],
        'bicycle_fatalities': result[4],
        'ped_count': result[5],
        'ped_fatalities': result[6],
        'vehicle_occupants': result[7] - result[3] - result[5],
        'collision_type': result[8],
    }
    return crash 


@app.get('/api/crash-data/v1/summary', response_model=Dict[str, yearResponse])
def get_summary(
    state: str = Query(
        None,
        description='Select crashes by state'
    ),
    county: str = Query(
        None,
        description='Select crashes by county'
    ),
    municipality: str = Query(
        None,
        description='Select crashes by municipality'
    ),
    geoid: str = Query(
        None,
        description='Select crashes by geoid'
    ),
    geojson: str = Query(
        None,
        description='Select crashes by jeoson'
    ),
    ksi_only: bool = Query(
        False,
        description='Limit results to crashes with fatalities or major injuries only'
    ),
):
    '''
    Get a summary of crashes by year. Limit by geographic area and/or by crashes with fatalities or
    major injuries only.
    '''

    # build query incrementally, to add possible WHERE clauses before GROUP BY and 
    # to easily pass value parameter to execute in order to prevent SQL injection 
    severity_and_mode_query = """
        SELECT 
            year,
            SUM(fatalities),
            SUM(maj_inj),
            SUM(mod_inj),
            SUM(min_inj),
            SUM(unk_inj),
            SUM(uninjured),
            SUM(unknown),
            SUM(bicyclists),
            SUM(pedestrians),
            SUM(persons),
            count(id)
        FROM crash
    """

    collision_type_query = """
        SELECT 
            year,
            collision_type,
            count(collision_type) 
        FROM crash
    """

    cursor = get_db_cursor() 
    
    # build the where clause

    sub_clauses = []  # the individual "x = y" clauses
    values = []  # list of values that will be in the WHERE clause when executed

    if state or county or municipality:
        # state, county, and municipality can be chained together in the same query
        if state:
            sub_clauses.append("state = %s")
            values.append(state)
        if county:
            sub_clauses.append("county = %s")
            values.append(county)
        if municipality:
            sub_clauses.append("municipality = %s")
            values.append(municipality)
    elif geoid:
        # get the name and area type for this geoid
        cursor.execute("SELECT area_type, name from geoid where geoid = %s", [geoid])
        result = cursor.fetchone()
        if not result:
            raise HTTPException(
                status_code=404, 
                detail='No information found for given geoid.'
            )
        # now set up where clause
        sub_clauses.append(f"{result[0]} = %s")
        values.append(result[1])
    elif geojson:
        sub_clauses.append("ST_WITHIN(geom,ST_GeomFromGeoJSON(%s))")
        values.append(geojson)
            
    if ksi_only:
        sub_clauses.append("(fatalities > 0 OR maj_inj > 0)")

    # put the where clauses together
    if len(sub_clauses) == 0:
        where = ''
    elif len(sub_clauses) == 1:
        where = ' WHERE ' + sub_clauses[0]
    else:
        where = ' WHERE ' + ' AND '.join(sub_clauses)

    severity_and_mode_query += where + " GROUP BY year"
    collision_type_query += where + " GROUP BY year, collision_type"
    
    try:
        cursor.execute(severity_and_mode_query, values)
    except psycopg2.Error as e:
        raise HTTPException(
            status_code=400, 
            detail='Database error: ' + str(e)
        )
    
    result = cursor.fetchall()
    if not result:
        raise HTTPException(
            status_code=404, 
            detail='No information found for given type/value.'
        )

    summary = {}

    for row in result:
        summary[str(row[0])] = {
            'total crashes': row[11],
            'severity': {
                'fatal': row[1],
                'major': row[2],
                'moderate': row[3],
                'minor': row[4],
                'unknown severity': row[5],
                'uninjured': row[6],
                'unknown if injured': row[7]
            },
            'mode': {
                'bike': row[8],
                'ped': row[9],
                'vehicle occupants': row[10] - row[9] - row[8]
            },
            'type': {},
        } 

    # now get numbers/types of collisions per year and add to summary
    
    collision_type_query = cursor.execute(collision_type_query, values)
    result = cursor.fetchall()

    collisions_by_year = {}

    for row in result:
        try:
            collisions_by_year[str(row[0])][row[1]] = row[2]
        except KeyError:
            collisions_by_year[str(row[0])] = {}
            collisions_by_year[str(row[0])][row[1]] = row[2] 

    for k in summary.keys():
        summary[k]['type'] = collisions_by_year[k]
    return summary


@app.get('/api/crash-data/v1/crash-ids')
def get_crash_ids(geojson: str):
    '''Get a list of crash ids based on given criteria.'''

    # @TODO: more ways to get this info in addition to by geojson

    cursor = get_db_cursor()
    query = """
        SELECT id
        FROM crash
        WHERE ST_WITHIN(geom, ST_GeomFromGeoJSON(%s));
    """ 
        
    try:
        cursor.execute(query, [geojson])
    except psycopg2.Error as e:
        raise HTTPException(
            status_code=400, 
            detail='Database error: ' + str(e)
        )

    result = cursor.fetchall()
    
    if not result:
        return {'message': 'No crashes found for provided geojson'}
    
    ids = []

    for row in result:
        ids.append(row[0])
    return ids
