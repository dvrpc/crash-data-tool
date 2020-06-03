import calendar
from typing import Dict, List, Union

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import psycopg2

from config import PSQL_CREDS


class CrashResponse(BaseModel):
    month: str = Field(..., alias="Month")
    year: int = Field(..., alias="Year")
    max_severity: str = Field(..., alias="Maximum severity")
    vehicle_count: int = Field(..., alias="Vehicles")
    bicycle_count: int = Field(..., alias="Bicyclists")
    bicycle_fatalities: int = Field(..., alias="Bicyclist fatalities")
    ped_count: int = Field(..., alias="Pedestrians")
    ped_fatalities: int = Field(..., alias="Pedestrian fatalities")
    vehicle_occupants: Union[int, str] = Field(..., alias="Vehicle occupants")
    collision_type: str = Field(..., alias="Collision type")


class CrashResponseWithId(BaseModel):
    id: str
    month: str = Field(..., alias="Month")
    year: int = Field(..., alias="Year")
    max_severity: str = Field(..., alias="Maximum severity")
    vehicle_count: int = Field(..., alias="Vehicles")
    bicycle_count: int = Field(..., alias="Bicyclists")
    bicycle_fatalities: int = Field(..., alias="Bicyclist fatalities")
    ped_count: int = Field(..., alias="Pedestrians")
    ped_fatalities: int = Field(..., alias="Pedestrian fatalities")
    vehicle_occupants: Union[int, str] = Field(..., alias="Vehicle occupants")
    collision_type: str = Field(..., alias="Collision type")


class SeverityResponse(BaseModel):
    fatal: int = Field(..., alias="Fatal")
    major: int = Field(..., alias="Major")
    moderate: int = Field(..., alias="Moderate")
    minor: int = Field(..., alias="Minor")
    unknown_severity: int = Field(..., alias="Unknown severity")
    uninjured: int = Field(..., alias="Uninjured")
    unknown_if_injured: int = Field(..., alias="Unknown if injured")


class ModeResponse(BaseModel):
    bike: int = Field(..., alias="Bicyclists")
    ped: int = Field(..., alias="Pedestrians")
    vehicle_occupants: int = Field(..., alias="Vehicle occupants")


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
    total_crashes: int = Field(..., alias="Total crashes")
    severity: Union[SeverityResponse, None]
    mode: Union[ModeResponse, None]
    type: Union[CollisionTypeResponse, None]


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


max_severity_lookup = {
    "0": "Fatality",
    "1": "Major injury",
    "2": "Moderate injury",
    "3": "Minor injury",
    "4": "Unknown injury",
    "5": "No fatality or injury",
}

app = FastAPI(openapi_url="/api/crash-data/v1/openapi.json", docs_url="/api/crash-data/v1/docs")
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
    "/api/crash-data/v1/crashes", response_model=List[CrashResponseWithId], responses=responses,
)
def get_crashes():
    """Get information about all crashes."""
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
            max_severity,
            id
        FROM crash
    """

    try:
        cursor.execute(query)
    except psycopg2.Error as e:
        return JSONResponse(status_code=400, content={"message": "Database error: " + str(e)})

    result = cursor.fetchall()

    if not result:
        return JSONResponse(status_code=404, content={"message": "Error: no crashes found."})

    crashes = []
    for row in result:

        # persons is a nullable field, because there were some null values in NJ
        if row[7] is None:
            vehicle_occupants = "Unknown"
        else:
            vehicle_occupants = row[7] - row[3] - row[5]

        crash = {
            "id": row[10],
            "Month": calendar.month_name[row[0]],
            "Year": row[1],
            "Maximum severity": max_severity_lookup[row[9]],
            "Vehicles": row[2],
            "Bicyclists": row[3],
            "Bicyclist fatalities": row[4],
            "Pedestrians": row[5],
            "Pedestrian fatalities": row[6],
            "Vehicle occupants": vehicle_occupants,
            "Collision type": row[8],
        }
        crashes.append(crash)
    return crashes


@app.get(
    "/api/crash-data/v1/crashes/{id}", response_model=CrashResponse, responses=responses,
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
            max_severity
        FROM crash
        WHERE id = %s
        """

    try:
        cursor.execute(query, [id])
    except psycopg2.Error as e:
        return JSONResponse(status_code=400, content={"message": "Database error: " + str(e)})

    result = cursor.fetchone()

    if not result:
        return JSONResponse(status_code=404, content={"message": "Crash not found"})

    # persons is a nullable field, because there were some null values in NJ
    if result[7] is None:
        vehicle_occupants = "Unknown"
    else:
        vehicle_occupants = result[7] - result[3] - result[5]

    crash = {
        "Month": calendar.month_name[result[0]],
        "Year": result[1],
        "Maximum severity": max_severity_lookup[result[9]],
        "Vehicles": result[2],
        "Bicyclists": result[3],
        "Bicyclist fatalities": result[4],
        "Pedestrians": result[5],
        "Pedestrian fatalities": result[6],
        "Vehicle occupants": vehicle_occupants,
        "Collision type": result[8],
    }
    return crash


@app.get(
    "/api/crash-data/v1/summary", response_model=Dict[str, YearResponse], responses=responses,
)
def get_summary(
    state: str = Query(None, description="Select crashes by state"),
    county: str = Query(None, description="Select crashes by county"),
    municipality: str = Query(None, description="Select crashes by municipality"),
    geoid: str = Query(None, description="Select crashes by geoid"),
    geojson: str = Query(None, description="Select crashes by geoson"),
    ksi_only: bool = Query(
        False, description="Limit results to crashes with fatalities or major injuries only",
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
            if not county and municipality in [
                "Elk Township",
                "Franklin Township",
                "Middletown Township",
                "New Hanover Township",
                "Newtown Township",
                "Springfield Township",
                "Telford Borough",
                "Thornbury Township",
                "Tinicum Township",
                "Upper Providence Township",
                "Warwick Township",
                "Washington Township",
            ]:
                return JSONResponse(
                    status_code=400,
                    content={
                        "message": "The name of the municipality provided exists in more "
                        "than one county. Please also provide the county name."
                    },
                )
            sub_clauses.append("municipality = %s")
            values.append(municipality)
    elif geoid:
        # get the name and area type for this geoid
        # this checks the geoid table, rather than the crash table, because the crash table
        # only has geoids at the municipality level.
        cursor.execute("SELECT state, county, municipality from geoid where geoid = %s", [geoid])
        result = cursor.fetchone()
        if not result:
            return JSONResponse(status_code=404, content={"message": "Given geoid not found."},)
        # now set up where clause
        sub_clauses.append("state = %s")
        values.append(result[0])
        if result[1] is not None:
            sub_clauses.append("county = %s")
            values.append(result[1])
        if result[2] is not None:
            sub_clauses.append("municipality = %s")
            values.append(result[2])
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
        return JSONResponse(status_code=400, content={"message": "Database error: " + str(e)})

    result = cursor.fetchall()
    if not result:
        return JSONResponse(
            status_code=404, content={"message": "No information found for given parameters"},
        )

    summary = {}

    for row in result:
        summary[str(row[0])] = {
            "Total crashes": row[11],
            "severity": {
                "Fatal": row[1],
                "Major": row[2],
                "Moderate": row[3],
                "Minor": row[4],
                "Unknown severity": row[5],
                "Uninjured": row[6],
                "Unknown if injured": row[7],
            },
            "mode": {
                "Bicyclists": row[8],
                "Pedestrians": row[9],
                "Vehicle occupants": row[10] - row[9] - row[8],
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

    # set total crashes = 0 if year not present, to make charting easier/provide additional info
    years = ["2014", "2015", "2016", "2017", "2018"]

    for each in years:
        if not summary.get(each):
            summary[each] = {"Total crashes": 0}
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
        return JSONResponse(status_code=400, content={"message": "Database error: " + str(e)})

    result = cursor.fetchall()

    if not result:
        return JSONResponse(
            status_code=404, content={"message": "No crash ids found for given parameters."},
        )

    ids = []

    for row in result:
        ids.append(row[0])
    return ids
