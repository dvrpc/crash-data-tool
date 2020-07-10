/* Use psql: psql -f /path/to/this/file -d name_of_database (and potentially user, port, localhost
depending on setup)
*/

BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;

/* create one table for all the data 
There are four categories of how people are physically affected by a crash:
    - fatality ("fatalities" column below)
    - injured (injuries)
    - not injured (uninjured)
    - unknown if injured (unknown)

Within injuries, there are also four categories:
    - major (maj_inj)
    - moderate (mod_inj)
    - minor (min_inj)
    - unknown severity (unk_inj) - note that NJ does not have this category
*/

CREATE TABLE crash (
    id text PRIMARY KEY NOT NULL,
    geoid bigint,
    state text NOT NULL,
    county text NOT NULL,
    municipality text NOT NULL,
    latitude numeric,
    longitude numeric,
    sri text,
    milepost numeric,
    geom geometry(Point, 4326),
    year integer NOT NULL,
    month integer NOT NULL,
    collision_type text NOT NULL,
    vehicles integer NOT NULL,
    persons integer,
    bicyclists integer NOT NULL,
    pedestrians integer NOT NULL,
    fatalities integer NOT NULL,
    injuries integer NOT NULL,
    uninjured integer,
    unknown integer NOT NULL,
    maj_inj integer NOT NULL,
    mod_inj integer NOT NULL,
    min_inj integer NOT NULL,
    unk_inj integer,
    max_severity text,
    bike_fatalities integer NOT NULL,
    ped_fatalities integer NOT NULL
);

CREATE INDEX geom_index ON crash USING GIST (geom);

COMMIT;
