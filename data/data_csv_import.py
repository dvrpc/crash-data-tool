import csv
import re
import time

import psycopg2

from config import PSQL_CREDS

"""
Import data from csv files pulled from the MS Access DB into Postgresql for the Crash Data API.

Note that the code skips the first row of CSV files, as it expects that row to be header.
"""


def parse_dms(dms):
    """Parse lat/lon in formt DD MM:SS.SSS to individual components"""
    parts = re.split("[^\d\w.]+", dms)
    return parts[0], parts[1], parts[2]


def dms2dd(degrees, minutes, seconds, direction):
    """Convert lat/lon from degrees, minutes, seconds to decimal degrees"""
    dd = float(degrees) + float(minutes) / 60 + float(seconds) / (60 * 60)
    if direction == "S" or direction == "W":
        dd *= -1
    return dd


lookup_pa = {
    "county": {
        "09": "Bucks",
        "67": "Philadelphia",
        "15": "Chester",
        "23": "Delaware",
        "46": "Montgomery",
    },
    "muni": {},
    "collision": {
        "0": "Non-collision",
        "1": "Rear-end",
        "2": "Head-on",
        "3": "Rear-to-rear (backing)",
        "4": "Angle",
        "5": "Sideswipe (same direction)",
        "6": "Sideswipe (opposite direction)",
        "7": "Hit fixed object",
        "8": "Hit pedestrian",
        "9": "Other or unknown",
    },
}

lookup_nj_collision = {
    "10": "Non-collision",
    "01": "Rear-end",
    "07": "Head-on",
    "04": "Head-on",
    "08": "Rear-to-rear (backing)",
    "03": "Angle",
    "02": "Sideswipe (same direction)",
    "05": "Sideswipe (opposite direction)",
    "11": "Hit fixed object",
    "06": "Hit fixed object",
    "14": "Hit pedestrian",
    "13": "Hit pedestrian",
    "12": "Other or unknown",
    "99": "Other or unknown",
    "00": "Other or unknown",
    "15": "Other or unknown",
    "16": "Other or unknown",
    "09": "Other or unknown",
}

# connect to postgres database
con = psycopg2.connect(PSQL_CREDS)
cur = con.cursor()

# delete all existing records from postgres (previous data import)
cur.execute("DELETE FROM crash")

start = time.time()

# enter MCD values into lookup_pa (unnecessary for NJ)
with open("PA_MCDlist.txt", newline="") as csvfile:
    reader = csv.DictReader(csvfile, delimiter=",")
    for row in reader:
        # Birmingham Township in Delaware County was renamed to Chadds Ford Township in 1996, but
        # PennDot still calls it b-ham. Change this in the lookup so the new name gets added
        # to the data table below
        if row["MCDcode"] == "23202":
            lookup_pa["muni"][row["MCDcode"]] = "Chadds Ford Township"
        # Fix misspelling of Newtown Township in Delaware County
        elif row["MCDcode"] == "23208":
            lookup_pa["muni"][row["MCDcode"]] = "Newtown Township"
        else:
            lookup_pa["muni"][row["MCDcode"]] = row["MCDname"]

# insert PA crash data into db
with open("PA_CRASH.txt", newline="") as csvfile:
    reader = csv.DictReader(csvfile, delimiter=",")
    for row in reader:

        # deal with possible null values for lat and log and convert from DMS to DD
        # doing this because Access only exports floats to 2 decimal points, which is insufficient
        # so use the DMS fields in the database instead of the DD fields
        if not row["LATITUDE"].strip():
            lat = None
        else:
            d, m, s = parse_dms(row["LATITUDE"])
            lat = dms2dd(d, m, s, "N")

        if not row["LONGITUDE"].strip():
            lon = None
        else:
            d, m, s = parse_dms(row["LONGITUDE"])
            lon = dms2dd(d, m, s, "W")

        cur.execute(
            """
            INSERT INTO crash (
                id, state, county, municipality,
                latitude, longitude, year, month, collision_type,
                vehicles, persons, bicyclists, pedestrians,
                fatalities, injuries,
                uninjured,
                unknown,
                maj_inj, mod_inj, min_inj, unk_inj,
                bike_fatalities, ped_fatalities
            )
            VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s
            )
            """,
            [
                "PA" + row["CRN"],
                "pa",
                lookup_pa["county"][row["COUNTY"]],
                lookup_pa["muni"][row["MUNICIPALITY"]],
                lat,
                lon,
                row["CRASH_YEAR"],
                row["CRASH_MONTH"],
                lookup_pa["collision"][row["COLLISION_TYPE"]],
                int(row["VEHICLE_COUNT"]),
                int(row["PERSON_COUNT"]),
                int(row["BICYCLE_COUNT"]),
                int(row["PED_COUNT"]),
                int(row["FATAL_COUNT"]),
                int(row["TOT_INJ_COUNT"]),
                int(row["PERSON_COUNT"])
                - int(row["FATAL_COUNT"])
                - int(row["TOT_INJ_COUNT"])
                - int(row["UNK_INJ_PER_COUNT"]),
                int(row["UNK_INJ_PER_COUNT"]),
                int(row["MAJ_INJ_COUNT"]),
                int(row["MOD_INJ_COUNT"]),
                int(row["MIN_INJ_COUNT"]),
                int(row["UNK_INJ_DEG_COUNT"]),
                int(row["BICYCLE_DEATH_COUNT"]),
                int(row["PED_DEATH_COUNT"]),
            ],
        )


def insert_nj_accidents(filename):
    """Insert data from the NJ 1_accidents tables into db."""
    with open(filename, newline="") as csvfile:
        reader = csv.DictReader(csvfile, delimiter=",")
        for row in reader:
            # skip any crashes from before the year 2014
            if int(row["CrashDate"].split("/")[2]) < 2014:
                continue
            # change some abbreviations
            if "TWP" in row["MunicipalityName"]:
                municipality = row["MunicipalityName"].replace("TWP", "Township")
            elif "BORO" in row["MunicipalityName"]:
                municipality = row["MunicipalityName"].replace("BORO", "Borough")
            else:
                municipality = row["MunicipalityName"]

            # deal with possible null values for various fields
            # also put negative on long
            lat = None if not row["Latitude"].strip() else float(row["Latitude"])
            lon = None if not row["Longitude"].strip() else -(abs(float(row["Longitude"])))
            if not row["CrashTypeCode"]:
                collision_type = "Other or unknown"
            else:
                collision_type = lookup_nj_collision[row["CrashTypeCode"]]
            unknown = 0 if not row["Unknow_Injury"] else int(row["Unknow_Injury"])

            # there are some missing values for TotalPerson
            if not row["TotalPerson"].strip():
                person_count = None
                uninjured = None
            else:
                person_count = int(row["TotalPerson"])
                uninjured = (
                    person_count - int(row["TotalKilled"]) - int(row["TotalInjured"]) - unknown
                )

            maj_inj = 0 if not row["Major_Injury"] else int(row["Major_Injury"])
            mod_inj = 0 if not row["Moderate_Injury"] else int(row["Moderate_Injury"])
            min_inj = 0 if not row["Minor_Injury"] else int(row["Minor_Injury"])

            cur.execute(
                """
                INSERT INTO crash (
                    id, state, county, municipality,
                    latitude, longitude, year, month,
                    collision_type,
                    vehicles, persons,
                    fatalities, injuries, uninjured, unknown,
                    maj_inj, mod_inj, min_inj, unk_inj,
                    bicyclists, bike_fatalities, pedestrians, ped_fatalities
                )
                VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s
                )
                """,
                [
                    "NJ" + row["CaseNumber"],
                    "nj",
                    row["CountyName"].title(),
                    municipality.title(),
                    lat,
                    lon,
                    row["CrashDate"].split("/")[2],
                    row["CrashDate"].split("/")[0],
                    collision_type,
                    int(row["TotalVehiclesInvolved"]),
                    person_count,
                    int(row["TotalKilled"]),
                    int(row["TotalInjured"]),
                    uninjured,
                    unknown,
                    maj_inj,
                    mod_inj,
                    min_inj,
                    0,
                    0,
                    0,
                    0,
                    0,
                ],
            )


def insert_nj_pedestrians(filename):
    """Insert data from the NJ 4_pedestrians tables into db."""
    with open(filename, newline="") as csvfile:
        reader = csv.DictReader(csvfile, delimiter=",")
        for row in reader:
            if row["PhysicalCondition"] == "01":  # "Killed"
                if row["IsBycyclist"].strip() == "Y":
                    bicycle_fatality = 1
                    ped_fatality = 0
                else:
                    bicycle_fatality = 0
                    ped_fatality = 1
            else:
                bicycle_fatality = 0
                ped_fatality = 0

            if row["IsBycyclist"].strip() == "Y":
                bicyclist = 1
                pedestrian = 0
            else:
                bicyclist = 0
                pedestrian = 1

            cur.execute(
                """
                UPDATE crash
                SET
                    bicyclists = bicyclists + %s,
                    pedestrians = pedestrians + %s,
                    bike_fatalities = bike_fatalities + %s,
                    ped_fatalities = ped_fatalities + %s
                WHERE id = %s
                """,
                [bicyclist, pedestrian, bicycle_fatality, ped_fatality, "NJ" + row["CaseNumber"]],
            )


insert_nj_accidents("NJ_2010_16_1_Accidents.csv")
insert_nj_accidents("NJ_2017_18_1_Accidents.csv")
insert_nj_pedestrians("NJ_2010_16_4_Pedestrians.txt")
insert_nj_pedestrians("NJ_2017_18_4_Pedestrians.txt")

# add the geom field

cur.execute("UPDATE crash SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);")

con.commit()
cur.close()
con.close()

print("Postgres insertion took", time.time() - start, "seconds to run.")
