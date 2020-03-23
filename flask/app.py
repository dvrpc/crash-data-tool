"""
author: Robert Beatty
date: March 11, 2019
modified: November 12, 2019
purpose: simple REST API to retrieve summary information in DVRPC's crash data tool

@TODO (not listed elsewhere in the code):
    - create list of possible values for the various area "types" - check against

"""
from flask import Flask, request, abort, jsonify
from flask_cors import CORS
from config import PSQL_CREDS
import psycopg2 
from psycopg2 import sql
import json

app = Flask(__name__)
CORS(app)


# Exceptions
class BadArgsException(Exception):
    pass


class BadTypeException(Exception):
    pass


def get_db_cursor():
    connection = psycopg2.connect(PSQL_CREDS)
    return connection.cursor()


@app.route('/api/crash-data/v2/documentation')
def docs():
    """
    @TODO:  create documentation page using flask's render_template function to deliver an HTML file
            to give details about how to use the API
    """

    return '<html><p>this will be the docs page</p></html>'


@app.route('/api/crash-data/v2/popupInfo', methods=['GET'])
def get_popup_info():
    '''
    @TODO: add docstring
    '''

    if id is not None:
        cursor = get_db_cursor()
        query = """
            SELECT
                crash.month,
                crash.year,
                type.vehicle_count,
                type.bicycle,
                type.ped,
                type.persons_involved,
                type.collision_type
            FROM crash
            JOIN
                severity ON crash.crash_id = severity.crash_id
            JOIN
                type ON crash.crash_id = type.crash_id
            WHERE
                crash.crash_id = {0};
        """

        payload = {}
        
        # success message
        payload['status'] = 200
        
        try:
            cursor.execute(sql.SQL(query.format(id)))
            rows = cursor.fetchall()
            if len(rows) > 0:
                for row in rows:
                    result = {
                        'month': row[0],
                        'year': row[1],
                        'vehicle_count': row[2],
                        'bike': row[3],
                        'ped': row[4],
                        'persons': row[5],
                        'collision_type': row[6]
                    }
                    payload['features'] = result
                    return json.dumps(payload, indent=4)
            else:
                # query returns no results
                abort(422)
        # alter payload status/message if query fails
        except Exception as e:
            # @TODO: more meaningful error response
            # @TODO: use possible exceptions 
            abort(401)
    # alter payload message for invalid query
    else:
        # @TODO: more meaningful error response
        abort(404)


@app.route('/api/crash-data/v2/sidebarInfo', methods=['GET'])
def get_sidebar_info():
    '''
    @TODO: add docstring
    '''

    args = request.args
    possible_types = ['county', 'municipality', 'geojson']

    if not args.get('type') or not args.get('value'):
        raise BadArgsException
        abort(422)
    
    if args['type'] not in possible_types:
        # @TODO: more meaningful error response
        raise BadTypeException
        abort(404)
    
    cursor = get_db_cursor() 
    qryRef = {
        "county": "crash.county = '{0}'".format(args.get('value')),
        "municipality": "crash.municipality LIKE '{0}'".format(args.get('value')),
        "geojson": "ST_WITHIN(location.geom,ST_GeomFromGeoJSON('{0}'))".format(args.get('value'))
    }

    statement = qryRef[args.get('type')]
    query = """
        SELECT
            crash.year, COUNT(crash.crash_id) AS count,
            SUM(severity.fatal) AS fatalities, 
            SUM(severity.major) AS major_inj, 
            SUM(severity.minor) AS minor_inj, 
            SUM(severity.uninjured) AS uninjured, 
            SUM(severity.unknown) AS unknown,
            SUM(type.bicycle) AS bike, 
            SUM(type.ped) AS ped,
            SUM(type.persons_involved) AS persons_involved,
            type.collision_type AS type
        FROM crash
        JOIN severity ON severity.crash_id = crash.crash_id
        JOIN location ON location.crash_id = crash.crash_id
        JOIN type ON type.crash_id = crash.crash_id
        WHERE {}
        GROUP BY crash.year, type.collision_type;
    """

    try:
        payload = {}
        cursor.execute(query.format(statement))
        result = cursor.fetchall()

        for row in result:
            if str(row[0]) in payload:  
                payload[str(row[0])]['type'][str(row[10])] = row[1]
            else:
                payload[str(row[0])] = {
                    'severity': {
                        'fatal': row[2],
                        'major': row[3],
                        'minor': row[4],
                        'uninjured': row[5],
                        'unknown': row[6]
                    },
                    'mode': {
                        'bike': row[7],
                        'ped': row[8],
                        'persons': row[9]
                    },
                    'type': {
                        str(row[10]): row[1]
                    }
                }
        return json.dumps(payload, indent=4)
    except Exception as e:
        abort(404)


@app.route('/api/crash-data/v2/crashId', methods=['GET'])
def get_geojson_info():
    '''
    @TODO: add docstring
    '''

    # grab crash id  @TODO: crash_id or geojson?
    geojson = request.args.get('geojson')

    # connect to db
    cursor = get_db_cursor()
    query = """
        SELECT
            crash.crash_id
        FROM crash
        JOIN location ON location.crash_id = crash.crash_id
        WHERE ST_WITHIN(location.geom, ST_GeomFromGeoJSON('{0}'));
    """
    
    payload = {}
    ids = []

    if geojson is not None:
        # success message
        payload['status'] = 200
        
        try:
            cursor.execute(sql.SQL(query.format(geojson)))
            result = cursor.fetchall()
            if len(result) > 0:
                for row in result:
                    ids.append(row[0])
                return jsonify(ids)
            else:
                # query returns no results
                abort(422)
        # alter payload status/message if query fails
        except Exception as e:
            abort(401)
    # alter payload message for invalid query
    else:
        abort(404)
