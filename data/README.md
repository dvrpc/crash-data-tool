# Instructions

If you are just updating data, start from step 4. However, note that as currently written, the data import first erases any existing data from the database. 

1. Create the database in postgres: 
   1. switch to the postgres user: `su postgres`
   2. create the database: `createdb crash_data`
2. cd into the data directory (or some diretory where all of these files are included)
3. Use psql to create the table and indexes: `psql -d crash_data -f create_table_and_geom_index.sql`
4. Activate the virtual environment if not activated already: `source ../api/ve/bin/activate` (or wherever it's located)
5. Import the data into the table: `python data_csv_import.py`
