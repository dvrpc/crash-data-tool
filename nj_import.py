"""
Author: Sean
Date: November 1, 2019
Purpose:
    1. Import NJ crash data with selected fields from Access DB for use in DVRPC's crash data web tool
    2. Convert coded values where necessary
        - Month
        - Collision Type
        - Max Severity
    3. Transform NJ table into PA schema

Dependencies:
    - Virtual Environment: .../db_import/venv/Lib/activate.bat
    - psycopg2 -- PostgreSQL connections
    - pyodbc -- Microsoft Access connections
"""

import psycopg2 as psql
import pyodbc as msa
from datetime import datetime

lookup = {
    'monthlookup': {
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
        '10':'Non collision',
        '01':'Rear-end',
        '07':'Head-on',
        '04':'Head-on',
        '08':'Rear-to-rear (Backing)',
        '03':'Angle',
        '02':'Sideswipe (same dir.)',
        '05':'Sideswipe (Opposite dir.)',
        '11':'Hit fixed object',
        '06':'Hit fixed object',
        '14':'Hit pedestrian',
        '13':'Hit pedestrian',
        '12':'Other or Unknown',
        '99':'Other or Unknown',
        '00':'Other or Unknown',
        '15':'Other or Unknown',
        '16':'Other or Unknown',
        '09':'Other or Unknown'
    },
    'severity': {
        'Fatal': 'Killed',
        'Injury - Maj': 'Major Injury',
        'Injury - Mod': 'Moderate Injury',
        'Injury - Min': 'Minor Injury',
        'Property Damage Only': 'Injury/Unknown Severity'
    }
}

conn_str = (
    r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
    r'DBQ=\\ehe01\dvrpc_shared\CrashData\NJ2017-2018\NJCrashData_17-18.accdb'
)

## connect to dbs
    ## postgres db is local, recreate existing db from ./pa-crash-dump.sql
pg_con = psql.connect('host=localhost port=5432 user=postgres password=admin dbname=crash_data')
pg_cur = pg_con.cursor()
pg_con.autocommit = True

access_con = msa.connect(conn_str)
access_cur = access_con.cursor()

## all records
access_qry_accidents = """
SELECT *
FROM WebAppTable;
"""

## crash info insert query
crash_insert = """
INSERT INTO crash (crash_id, county, year, month, municipality, state)
VALUES ('{0}', '{1}', {2}, '{3}', '{4}', '{5}')
"""

## crash severity
severity_insert = """
INSERT INTO severity (crash_id, max_severity, fatal, major, moderate, minor, uninjured, unknown)
VALUES ('{0}', '{1}', {2}, {3}, {4}, {5}, {6}, {7})"""

## crash type
type_insert = """
INSERT INTO type (crash_id, collision_type, persons_involved, vehicle_count, bicycle, ped)
VALUES ('{0}', '{1}', {2}, {3}, {4}, {5});
"""

## grab all crashes
access_cur.execute(access_qry_accidents.format())

cnt = 1
for row in access_cur.fetchall():
    year = (row[3]).strftime("%d/%m/%Y")[-4:]
    month = lookup['monthlookup'][(row[3]).strftime("%m/%d/%Y")[:2]]
    severity = lookup['severity'][str(row[5])]
    collision = lookup['collision'][str(row[4])]
    county = str(row[1]).lower().capitalize()
    mun = str(row[2]).lower().title()

    try:
        pg_cur.execute(crash_insert.format(row[0], county, year, month, mun, 'nj'))
        pg_cur.execute(severity_insert.format(row[0], severity, row[7], row[8], row[9], row[10], row[15], row[11]))
        pg_cur.execute(type_insert.format(row[0], collision, row[6], row[12], row[13], row[14]))
        cnt += 1
        print('CRN {} loaded to db'.format(row[0]))
    except Exception as e:
        print('CRN {} did not upload to db'.format(row[0]))
        print(e.message)
print('successfully inserted {} records into table'.format(cnt))
pg_con.close()