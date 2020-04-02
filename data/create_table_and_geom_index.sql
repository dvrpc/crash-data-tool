/* Use psql: psql -f /path/to/this/file -d name_of_database (and potentially user, port, localhost
depending on setup)
*/

BEGIN;

CREATE EXTENSION postgis;

/* create one table for all the data */
CREATE TABLE crash (
    id text PRIMARY KEY NOT NULL,
    state text NOT NULL,
    county text NOT NULL,
    municipality text NOT NULL,
    latitude numeric,
    longitude numeric,
    geom geometry(Point, 4326),
    year integer NOT NULL,
    month text NOT NULL,
    collision_type text NOT NULL,
    vehicle_count integer NOT NULL,
    person_count integer,
    bicycle_count integer NOT NULL,
    ped_count integer NOT NULL,
    fatality_count integer NOT NULL,
    injured_count integer NOT NULL,
    uninjured_count integer,
    maj_inj integer NOT NULL,
    mod_inj integer NOT NULL,
    min_inj integer NOT NULL,
    unk_inj integer NOT NULL,
    bicycle_fatalities integer NOT NULL,
    ped_fatalities integer NOT NULL
);

CREATE INDEX geom_index ON crash USING GIST (geom);

COMMIT;
