"""
@TODO (not listed elsewhere in the code):
    - create list of possible values for the various area "types" - check against
    - add try/except for connecting to database
    - for get_crash(), figure out how to return 400 if <id> not provided
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2 

from config import PSQL_CREDS

app = Flask(__name__)
CORS(app)


def get_db_cursor():
    connection = psycopg2.connect(PSQL_CREDS)
    return connection.cursor()


@app.route('/api/crash-data/v1/documentation')
def docs():
    """
    @TODO: Most of this. 
    """

    return '''
        <html>
            <ul>
                <li>"api/crash-data/v1/crashes/id"</li>
                    <ul>
                        <li>path parameter "id" required</li>
                    </ul>
                <li>"api/crash-data/v1/summary"</li>
                    <ul>
                        <li>"type" and "value" query parameters required</li>
                    </ul>
                <li>"api/crash-data/v1/crash-ids"</li>
                    <ul>
                        <li>"geojson" query parameter required</li>
                    </ul>
            </ul>
        </html>
    '''


@app.route('/api/crash-data/v1/crashes/<id>', methods=['GET'])
def get_crash(id):
    '''Return select fields about an individual crash.'''
    if not id:
        return jsonify({'message': 'Required path parameter *id* not provided'}), 400
    
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
            type 
        ON 
            crash.crash_id = type.crash_id
        WHERE
            crash.crash_id = %s 
        """

    try:    
        cursor.execute(query, [id])
    except psycopg2.Error as e:
        return jsonify({'message': 'Database error: ' + str(e)}), 400
        
    result = cursor.fetchone()
    
    if not result:
        return jsonify({'message': 'Crash not found'}), 404
    
    crash = {
        'month': result[0],
        'year': result[1],
        'vehicle_count': result[2],
        'bike': result[3],
        'ped': result[4],
        'vehicle_occupants': result[5] - result[4] - result[3],
        'collision_type': result[6],
    }
    return jsonify(crash) 


@app.route('/api/crash-data/v1/summary', methods=['GET'])
def get_summary():
    '''
    Return summary of various attributes by year.
    *type* and *value* parameters will limit geographic area.
    If *ksi_only* == yes, return only fatal and major crashes.
    
    @TODO: 
        - rename to .../v2/summary?
        - take closer look at how resulting payload is created
    '''

    args = request.args
    keys = list(args.keys())

    if 'type' not in keys or 'value' not in keys:
        return jsonify({'message': '*type* and *value* are required parameters'}), 400

    if args.get('type') not in ['county', 'municipality', 'geojson']:
        return jsonify(
            {
                'message': 
                '*type* must be one of *county*, *municipality*, or *geojson*'
            }
        ), 400

    # build query incrementally, to add possible WHERE clauses before GROUP BY and 
    # to easily pass value parameter to execute in order to prevent SQL injection 
    query = """
        SELECT
            crash.year, 
            COUNT(crash.crash_id) AS count,
            SUM(severity.fatal) AS fatalities, 
            SUM(severity.major) AS major_inj,
            SUM(severity.moderate) AS moderate_inj, 
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
    """

    if args.get('type') == 'county':
        query += " WHERE crash.county = %s"
    elif args.get('type') == 'municipality':
        query += " WHERE crash.municipality = %s"
    elif args.get('type') == 'geojson':
        query += " WHERE ST_WITHIN(location.geom,ST_GeomFromGeoJSON(%s))"
    
    if args.get('ksi_only') == 'yes':
        query += " AND (severity.fatal > 0 OR severity.major > 0)"
    
    query += " GROUP BY crash.year, type.collision_type;"
    
    cursor = get_db_cursor() 
   
    try:
        cursor.execute(query, [args.get('value')])
    except psycopg2.Error as e:
        return jsonify({'message': 'Database error: ' + str(e)}), 400
    
    result = cursor.fetchall()
    
    if not result:
        return jsonify({'message': 'No information found for given type/value.'}), 404

    # create dictionary to return, with data summarized by year
    payload = {}
     
    for row in result:
        if str(row[0]) in payload: 
            payload[str(row[0])]['type'][str(row[11])] = row[1]
        else:
            payload[str(row[0])] = {
                'severity': {
                    'fatal': row[2],
                    'major': row[3],
                    'moderate': row[4],
                    'minor': row[5],
                    'uninjured': row[6],
                    'unknown': row[7]
                },
                'mode': {
                    'bike': row[8],
                    'ped': row[9],
                    'vehicle_occupants': row[10] - row[9] - row[8]
                },
                'type': {
                    str(row[11]): row[1]
                }
            }
    return jsonify(payload)


@app.route('/api/crash-data/v1/crash-ids', methods=['GET'])
def get_crash_ids():
    '''Return list of crash_ids based on provided parameters.'''

    # @TODO: more ways to get this info in addition to by geojson

    geojson = request.args.get('geojson')
    
    if not geojson:
        return jsonify({'Message': 'Required parameter *geojson* not provided.'}), 400

    cursor = get_db_cursor()
    query = """
        SELECT
            crash.crash_id
        FROM crash
        JOIN location ON location.crash_id = crash.crash_id
        WHERE ST_WITHIN(location.geom, ST_GeomFromGeoJSON(%s));
    """ 
        
    try:
        cursor.execute(query, [geojson])
    except psycopg2.Error as e:
        return jsonify({'message': 'Database error: ' + str(e)}), 400

    result = cursor.fetchall()
    
    if not result:
        return jsonify({'message': 'No crashes found for provided geojson'}), 404
    
    ids = []

    for row in result:
        ids.append(row[0])
    return jsonify(ids)
