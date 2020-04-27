import calendar
from typing import Dict

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import psycopg2

from config import PSQL_CREDS


class CrashResponse(BaseModel):
    month: str
    year: int
    max_severity: str
    vehicle_count: int
    bicycle_count: int
    bicycle_fatalities: int
    ped_count: int
    ped_fatalities: int
    vehicle_occupants: int
    collision_type: str


class SeverityResponse(BaseModel):
    fatal: int
    major: int
    moderate: int
    minor: int
    unknown_severity: int = Field(..., alias="unknown severity")
    uninjured: int
    unknown_if_injured: int = Field(..., alias="unknown if injured")


class ModeResponse(BaseModel):
    bike: int
    ped: int
    vehicle_occupants: int = Field(..., alias="vehicle occupants")


class CollisionTypeResponse(BaseModel):
    non_collision: int = Field(0, alias="Non-collision")
    rear_end: int = Field(0, alias="Rear-end")
    head_on: int = Field(0, alias="Head-on")
    rear_to_rear: int = Field(0, alias="Rear-to-rear (backing)")
    angle: int = Field(0, alias="Angle")
    sideswipe_same: int = Field(0, alias="Sideswipe (same direction)")
    sideswipe_opp: int = Field(0, alias="Sideswipe (opposite direction)")
    hit_fixed: int = Field(0, alias="Hit fixed object")
    hit_ped: int = Field(0, alias="Hit pedestrian")
    other: int = Field(0, alias="Other or unknown")


class YearResponse(BaseModel):
    total_crashes: int = Field(..., alias="total crashes")
    severity: SeverityResponse
    mode: ModeResponse
    type: CollisionTypeResponse


class Message(BaseModel):
    message: str


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="DVRPC Crash Data API",
        version="1.0",
        description="Application Programming Interface for the Delaware Valley Regional "
        "Planning Commission's data on crashes in the region.",
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


def get_db_cursor():
    connection = psycopg2.connect(PSQL_CREDS)
    return connection.cursor()


app = FastAPI(
    openapi_url="/api/crash-data/v1/openapi.json", docs_url="/api/crash-data/v1/docs"
)
app.openapi = custom_openapi
responses = {
    400: {"model": Message, "description": "Bad Request"},
    404: {"model": Message, "description": "Not Found"},
}
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get(
    "/api/crash-data/v1/crashes/{id}",
    response_model=CrashResponse,
    responses=responses,
)
def get_crash(id: str):
    """Get information about an individual crash."""
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
            collision_type,
            fatalities,
            maj_inj,
            mod_inj,
            min_inj,
            unk_inj
        FROM crash
        WHERE id = %s 
        """

    try:
        cursor.execute(query, [id])
    except psycopg2.Error as e:
        return JSONResponse(
            status_code=400, content={"message": "Database error: " + str(e)}
        )

    result = cursor.fetchone()

    if not result:
        return JSONResponse(status_code=404, content={"message": "Crash not found"})

    if result[9]:
        print(result[9])
        max_severity = 'fatality'
    elif result[10]:
        max_severity = 'major injury'
    elif result[11]:
        max_severity = 'moderate injury'
    elif result[12]:
        max_severity = 'minor injury'
    elif result[13]:
        max_severity = 'unknown injury'
    else:
        max_severity = 'no fatality or injury'

    crash = {
        "month": calendar.month_name[result[0]],
        "year": result[1],
        "max_severity": max_severity,
        "vehicle_count": result[2],
        "bicycle_count": result[3],
        "bicycle_fatalities": result[4],
        "ped_count": result[5],
        "ped_fatalities": result[6],
        "vehicle_occupants": result[7] - result[3] - result[5],
        "collision_type": result[8],
    }
    return crash


@app.get(
    "/api/crash-data/v1/summary",
    response_model=Dict[str, YearResponse],
    responses=responses,
)
def get_summary(
    state: str = Query(None, description="Select crashes by state"),
    county: str = Query(None, description="Select crashes by county"),
    municipality: str = Query(None, description="Select crashes by municipality"),
    geoid: str = Query(None, description="Select crashes by geoid"),
    geojson: str = Query(None, description="Select crashes by geoson"),
    ksi_only: bool = Query(
        False,
        description="Limit results to crashes with fatalities or major injuries only",
    ),
):
    """
    Get a summary of crashes by year. Limit by geographic area and/or by crashes with fatalities or
    major injuries only.
    """

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
            return JSONResponse(
                status_code=404,
                content={"message": "Given geoid not found."},
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
        where = ""
    elif len(sub_clauses) == 1:
        where = " WHERE " + sub_clauses[0]
    else:
        where = " WHERE " + " AND ".join(sub_clauses)

    severity_and_mode_query += where + " GROUP BY year"
    collision_type_query += where + " GROUP BY year, collision_type"

    try:
        cursor.execute(severity_and_mode_query, values)
    except psycopg2.Error as e:
        return JSONResponse(
            status_code=400, content={"message": "Database error: " + str(e)}
        )

    result = cursor.fetchall()
    if not result:
        return JSONResponse(
            status_code=404,
            content={"message": "No information found for given parameters"},
        )

    summary = {}

    for row in result:
        summary[str(row[0])] = {
            "total crashes": row[11],
            "severity": {
                "fatal": row[1],
                "major": row[2],
                "moderate": row[3],
                "minor": row[4],
                "unknown severity": row[5],
                "uninjured": row[6],
                "unknown if injured": row[7],
            },
            "mode": {
                "bike": row[8],
                "ped": row[9],
                "vehicle occupants": row[10] - row[9] - row[8],
            },
            "type": {},
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
        summary[k]["type"] = collisions_by_year[k]
    return summary


@app.get("/api/crash-data/v1/crash-ids")
def get_crash_ids(geojson: str):
    """Get a list of crash ids based on given criteria."""

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
        return JSONResponse(
            status_code=400, content={"message": "Database error: " + str(e)}
        )

    result = cursor.fetchall()

    if not result:
        return JSONResponse(
            status_code=404,
            content={"message": "No crash ids found for given parameters."},
        )

    ids = []

    for row in result:
        ids.append(row[0])
    return ids
