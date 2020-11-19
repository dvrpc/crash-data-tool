# API

See https://alpha.dvrpc.org/api/crash-data/v1/docs for full API documentation.

Note: the API requires a connection string in the variable PSQL_CREDS in a config.py file in this directory. The connection string should include host, port, user, password, and dbname.

## Tests

The tests check both the database accuracy as well as the API functionality. Therefore, before running tests, follow the instructions in data/README.md to set up and populate a database.

After that, create/activate a virtual environment and run `python -m pytest` from this directory.
