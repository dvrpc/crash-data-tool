"""
Author: Robert Beatty
Modified: October 30, 2019, Slawrence
Date: March 8, 2019
Purpose:
    1. Import PA crash data with selected fields from Access DB for use in DVRPC's crash data web tool
    2. Convert coded values where necessary
        - County
        - Month
        - MCD
        - Collision Type
        - Max Severity

Dependencies:
    - Virtual Environment: .../db_import/venv/Lib/activate.bat
    - psycopg2 -- PostgreSQL connections
    - pyodbc -- Microsoft Access connections
"""

import psycopg2 as psql
import pyodbc as msa

lookup = {
    'county': {
        '09': 'Bucks',
        '67': 'Philadelphia',
        '15': 'Chester',
        '23': 'Delaware',
        '46': 'Montgomery'
    },
    'muni': {},
    'month': {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
    },
    'collision': {
        '0': 'Non-collision',
        '1': 'Rear-end',
        '2': 'Head-on',
        '3': 'Rear-to-Rear (Backing)',
        '4': 'Angle',
        '5': 'Sideswipe, same direction',
        '6': 'Sideswipe, opp. direction',
        '7': 'Hit fixed object',
        '8': 'Hit pedestrian',
        '9': 'Other or unknown'
    },
    'severity': {
        '0': 'Not Injured',
        '1': 'Killed',
        '2': 'Major Injury',
        '3': 'Moderate Injury',
        '4': 'Minor Injury',
        '8': 'Injury/Unknown Severity',
        '9': 'Unknown'

    }
}

## path to most up-to-date PA crash database
conn_str = (
    r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
    r'DBQ=\\ehe01\dvrpc_shared\CrashData\PA2014-2018Crash\PA Crash 2014-2018.accdb'
)

## connect to dbs
    ## postgres db is local, recreate existing db from ./pa-crash-dump.sql
pg_con = psql.connect('host=localhost port=5432 user=postgres password=admin dbname=crash_data')
pg_cur = pg_con.cursor()
pg_con.autocommit = True

access_con = msa.connect(conn_str)
access_cur = access_con.cursor()


## build MCD lookup
mcd_values = """
SELECT *
FROM MCDlist;
"""

access_cur.execute(mcd_values)

for mcd in access_cur.fetchall():
    lookup['muni'][str(mcd[0])] = str(mcd[1])


#define access db fields to grab
web_tool_fields = """
SELECT *
FROM WebAppTable
"""

#crash info insert query
crash_insert = """
INSERT INTO crash (crash_id, county, year, month, state)
VALUES ('{0}', '{1}', {2}, '{3}', '{4}')
"""

crash_update = """
UPDATE crash
SET municipality = '{1}'
WHERE crash_id = '{0}'
"""

#crash severity
severity_insert = """
INSERT INTO severity (crash_id, max_severity, fatal, major, moderate, minor, uninjured, unknown)
VALUES ('{0}', '{1}', {2}, {3}, {4}, {5}, {6}, {7})"""

#crash type
type_insert = """
INSERT INTO type (crash_id, collision_type, persons_involved, vehicle_count, bicycle, ped)
VALUES ('{0}', '{1}', {2}, {3}, {4}, {5});
"""

#grab all crashes
access_cur.execute(web_tool_fields)

cnt = 1
for row in access_cur.fetchall():
    county = lookup['county'][str(row[1])]
    month = lookup['month'][str(row[4])]
    severity = lookup['severity'][str(row[16])]
    collision = lookup['collision'][str(row[5])]
    muni = lookup['muni'][str(row[2])]

    try:
        pg_cur.execute(crash_insert.format(str(row[0]), county, row[3], month, 'pa'))
        pg_cur.execute(severity_insert.format(str(row[0]), severity, row[9], row[10], row[11], row[12], row[13], row[14]))
        pg_cur.execute(type_insert.format(str(row[0]), collision, row[6], row[7], row[8], row[15]))
        pg_cur.execute(crash_update.format(str(row[0]), muni))
        cnt += 1
        print('CRN {} loaded to db'.format(row[0]))
    except Exception as e:
        print('CRN {} did not upload to db'.format(row[0]))
        print(e.message)
print('successfully inserted {} records into table'.format(cnt))
pg_con.close()


