# Instructions

If you are just updating data, start from step 5. However, note that as currently written, the data import first erases any existing data from the database.

Note that this requires Postgres with the [PostGIS](https://postgis.net/) extension installed. See Postgres/PostGIS docs on installation. For Debian, install PostGIS on an already-installed Postgres 12 cluster with `sudo apt install postgres-12-postgis-3`.

1. Create the database in postgres:
    1. switch to the postgres user: `su postgres`
    2. create the database: `createdb crash_data`
2. cd into the data directory (or some directory where all of these files - as well as the files containing the data - are located)
3. Use psql to create the main table and indexes: `psql -d crash_data -f create_table_and_geom_index.sql` (note that you may need to specify the host as well: `-h localhost`)
4. Also create the geoid table (which maps geoids to county/municipality names): `psql -d crash_data -f geoid.sql`
5. Activate the virtual environment if not activated already: `source ../api/ve/bin/activate` (or wherever it's located)
6. Import the data into the table: `python data_csv_import.py`
