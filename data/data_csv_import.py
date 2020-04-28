import csv
import re
import time  # just for testing speed of various postgres inserts

import psycopg2

from config import PSQL_CREDS

"""
Import data from csv files pulled from the MS Access DB into Postgresql for the Crash Data API.

Note that the code skips the first row of CSV files, as it expects that row to be header.

For PA, this imports the crash data from the CRASH table, rather than the WebAppTable, as
the later is just a subset of CRASH that doesn't contain all necessary columns.

For NJ, ...

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
    reader = csv.reader(csvfile, delimiter=",")
    next(reader)  # skip header
    for row in reader:
        # Birmingham Township in Delaware County was renamed to Chadds Ford Township in 1996, but
        # PennDot still calls it b-ham. Change this in the lookup so the new name gets added
        # to the data table below
        if row[0] == "23202":
            lookup_pa["muni"][row[0]] = "Chadds Ford Township"
        # Fix misspelling of Newtown Township in Delaware County
        elif row[0] == "23208":
            lookup_pa["muni"][row[0]] = "Newtown Township"
        else:
            lookup_pa["muni"][row[0]] = row[1]

"""
0 CRN
1 DISTRICT
2 COUNTY
3 MUNICIPALITY
4 POLICE_AGCY
5 CRASH_YEAR
6 CRASH_MONTH
7 DAY_OF_WEEK
8 TIME_OF_DAY
9 HOUR_OF_DAY
10 ILLUMINATION
11 WEATHER
12 ROAD_CONDITION
13 COLLISION_TYPE
14 RELATION_TO_ROAD
15 INTERSECT_TYPE
16 TCD_TYPE
17 URBAN_RURAL
18 LOCATION_TYPE
19 SCH_BUS_IND
20 SCH_ZONE_IND
21 TOTAL_UNITS
22 PERSON_COUNT
23 VEHICLE_COUNT
24 AUTOMOBILE_COUNT
25 MOTORCYCLE_COUNT
26 BUS_COUNT
27 SMALL_TRUCK_COUNT
28 HEAVY_TRUCK_COUNT
29 SUV_COUNT
30 VAN_COUNT
31 BICYCLE_COUNT
32 FATAL_COUNT
33 TOT_INJ_COUNT
34 MAJ_INJ_COUNT
35 MOD_INJ_COUNT
36 MIN_INJ_COUNT
37 UNK_INJ_DEG_COUNT
38 UNK_INJ_PER_COUNT
39 UNBELTED_OCC_COUNT
40 UNB_DEATH_COUNT
41 UNB_MAJ_INJ_COUNT
42 BELTED_DEATH_COUNT
43 BELTED_MAJ_INJ_COUNT
44 MCYCLE_DEATH_COUNT
45 MCYCLE_MAJ_INJ_COUNT
46 BICYCLE_DEATH_COUNT
47 BICYCLE_MAJ_INJ_COUNT
48 PED_COUNT
49 PED_DEATH_COUNT
50 PED_MAJ_INJ_COUNT
51 COMM_VEH_COUNT
52 MAX_SEVERITY_LEVEL
53 DRIVER_COUNT_16YR
54 DRIVER_COUNT_17YR
55 DRIVER_COUNT_18YR
56 DRIVER_COUNT_19YR
57 DRIVER_COUNT_20YR
58 DRIVER_COUNT_50_64YR
59 DRIVER_COUNT_65_74YR
60 DRIVER_COUNT_75PLUS
61 LATITUDE
62 LONGITUDE
63 DEC_LAT
64 DEC_LONG
65 ARRIVAL_TM
66 DISPATCH_TM
67 EST_HRS_CLOSED
68 LANE_CLOSED
69 LN_CLOSE_DIR
70 NTFY_HIWY_MAINT
71 RDWY_SURF_TYPE_CD
72 SPEC_JURIS_CD
73 TCD_FUNC_CD
74 TFC_DETOUR_IND
75 WORK_ZONE_IND
76 WORK_ZONE_TYPE
77 WORK_ZONE_LOC
78 CONS_ZONE_SPD_LIM
79 WORKERS_PRES
80 WZ_CLOSE_DETOUR
81 WZ_FLAGGER
82 WZ_LAW_OFFCR_IND
83 WZ_LN_CLOSURE
84 WZ_MOVING
85 WZ_OTHER
86 WZ_SHLDER_MDN
"""
# insert PA crash data into db
with open("PA_CRASH.txt", newline="") as csvfile:
    reader = csv.reader(csvfile, delimiter=",")
    next(reader)  # skip header
    for row in reader:

        # deal with possible null values for lat and log and convert from DMS to DD
        # doing this because Access only exports floats to 2 decimal points, which is insufficient
        # so use the DMS fields in the database instead of the DD fields
        if not row[61].strip():
            lat = None
        else:
            d, m, s = parse_dms(row[61])
            lat = dms2dd(d, m, s, "N")

        if not row[62].strip():
            lon = None
        else:
            d, m, s = parse_dms(row[62])
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
                row[0],
                "pa",
                lookup_pa["county"][row[2]],
                lookup_pa["muni"][row[3]],
                lat,
                lon,
                row[5],
                row[6],
                lookup_pa["collision"][row[13]],
                int(row[23]),
                int(row[22]),
                int(row[31]),
                int(row[48]),
                int(row[32]),
                int(row[33]),
                int(row[22]) - int(row[32]) - int(row[33]) - int(row[38]),
                int(row[38]),
                int(row[34]),
                int(row[35]),
                int(row[36]),
                int(row[37]),
                int(row[46]),
                int(row[49]),
            ],
        )

# insert NJ crash data into db
"""
Column index/name from 1_accidents
0 CaseNumber
1 CountyName
2 MunicipalityName
3 CrashDate
4 CrashDayOfWeek
5 CrashTime
6 PoliceDeptCode
7 PoliceDepartment
8 PoliceStation
9 TotalKilled
10 TotalInjured
11 PedestriansKilled
12 PedestriansInjured
13 Severity
14 Intersection
15 AlcoholInvolved
16 HazMatInvolved
17 CrashTypeCode
18 TotalVehiclesInvolved
19 CrashLocation
20 LocationDirection
21 Route
22 RouteSuffix
23 SRI (Std Rte Identifier)
24 MilePost
25 RoadSystem
26 RoadCharacter
27 RoadCharacter-HorizontalAlign
28 RoadCharacter-Grade
29 RoadSurfaceType
30 SurfaceCondition
31 LightCondition
32 EnvironmentalCondition
33 RoadDividedBy
34 TemporaryTrafficControlZone
35 DistanceToCrossStreet
36 UnitOfMeasurement
37 DirectnFromCrossStreet
38 CrossStreetName
39 IsRamp
40 RampToFromRouteName
41 RampToFromRouteDirection
42 PostedSpeed
43 PostedSpeedCrossStreet
44 First Harmful Event
45 Latitude
46 Longitude
47 CellPhoneInUseFlag
48 OtherPropertyDamage
49 ReportingBadgeNo
50 newMP
51 InjuryLevel
52 DVRPCFC
53 TotalPerson
54 Major_Injury
55 Moderate_Injury
56 Minor_Injury
57 Unknow_Injury,
58 SRI
"""

with open("NJ_1_Accidents.csv", newline="") as csvfile:
    reader = csv.reader(csvfile, delimiter=",")
    next(reader)  # skip header
    for row in reader:
        # change some abbreviations
        if "TWP" in row[2]:
            municipality = row[2].replace("TWP", "Township")
        elif "BORO" in row[2]:
            municipality = row[2].replace("BORO", "Borough")
        else:
            municipality = row[2]

        # deal with possible null values for lat/lon, put negative on long
        if not row[45].strip():
            lat = None
        else:
            lat = float(row[45])

        if not row[46].strip():
            lon = None
        else:
            lon = -(abs(float(row[46])))

        unknown = 0 if not row[57] else int(row[57])

        # some missing values for TotalPersons
        if not row[53].strip():
            person_count = None
            uninjured = None
        else:
            person_count = int(row[53])
            uninjured = person_count - int(row[9]) - int(row[10]) - unknown

        maj_inj = 0 if not row[54] else int(row[54])
        mod_inj = 0 if not row[55] else int(row[55])
        min_inj = 0 if not row[56] else int(row[56])

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
                row[0],
                "nj",
                row[1].title(),
                municipality.title(),
                lat,
                lon,
                row[3].split("/")[2],
                row[3].split("/")[0],
                lookup_nj_collision[row[17]],
                int(row[18]),
                person_count,
                int(row[9]),
                int(row[10]),
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

# now update number/fatalities of bicyclists and pedestrians (they are combined in 1_accidents)
"""
0 "CaseNumber"
1 "PedestrianNumber"
2 "PhysicalCondition"
3 "AddressCity"
4 "AddressState"
5 "AddressZip"
6 "DateofBirth"
7 "Age"
8 "Sex"
9 "AlcoholTestGiven"
10 "AlcoholTestType"
11 "AlcoholTestResults"
12 "Charge1"
13 "Summons1"
14 "Charge2"
15 "Summons2"
16 "Charge3"
17 "Summons3"
18 "Charge4"
19 "Summons4"
20 "MultiChargeFlag"
21 "TrafficControls"
22 "ContributingCircumstances1"
23 "ContributingCircumstances2"
24 "DirectionofTravel"
25 "Pre-CrashAction"
26 "LocationofMostSevereInjury"
27 "TypeofMostSeverePhysInjury"
28 "RefusedMedicalAttention"
29 "SafetyEquipmentUsed"
30 "HospitalCode"
31 "PhysicalStatus1"
32 "PhysicalStatus2"
33 "IsBycyclist"
34 "IsOther"
"""

with open("NJ_4_Pedestrians.txt", newline="") as csvfile:
    reader = csv.reader(csvfile, delimiter=",")
    next(reader)  # skip header
    for row in reader:
        if row[2] == "01":  # pedestrian killed
            if row[33].strip() == "Y":
                bicycle_fatality = 1
                ped_fatality = 0
            else:
                bicycle_fatality = 0
                ped_fatality = 1
        else:
            bicycle_fatality = 0
            ped_fatality = 0

        if row[33].strip() == "Y":  # IsBicyclist
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
            [bicyclist, pedestrian, bicycle_fatality, ped_fatality, row[0]],
        )

# add the geom field

cur.execute(
    "UPDATE crash SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);"
)

con.commit()
cur.close()
con.close()

print("Postgres insertion took", time.time() - start, "seconds to run.")
