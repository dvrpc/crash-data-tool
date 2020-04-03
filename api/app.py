"""
@TODO (not listed elsewhere in the code):
    - create list of possible values for the various area "types" - check against
    - add try/except for connecting to database
    - for get_crash(), figure out how to return 400 if <id> not provided
"""

import calendar

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
                        <li>Optional parameters "type", "value", and "ksi_only". If one of "type"
                            or "value" is included, the other has to be included as well. Set
                            "ksi_only" = "yes" to receive KSI crashes.</li>
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
            month,
            year,
            vehicle_count,
            bicycle_count,
            bicycle_fatalities,
            ped_count,
            ped_fatalities,
            person_count,
            collision_type
        FROM crash
        WHERE id = %s 
        """

    try:    
        cursor.execute(query, [id])
    except psycopg2.Error as e:
        return jsonify({'message': 'Database error: ' + str(e)}), 400
        
    result = cursor.fetchone()
    
    if not result:
        return jsonify({'message': 'Crash not found'}), 404
    
    crash = {
        'month': calendar.month_name[result[0]],
        'year': result[1],
        'vehicle_count': result[2],
        'bicycle_count': result[3],
        'bicycle_fatalities': result[4],
        'ped_count': result[5],
        'ped_fatalities': result[6],
        'vehicle_occupants': result[7] - result[3] - result[5],
        'collision_type': result[8],
    }
    return jsonify(crash) 


@app.route('/api/crash-data/v1/summary', methods=['GET'])
def get_summary():
    '''
    Return summary of various attributes by year.
    If provided, *type* and *value* query parameters will limit result by geographic area.
    If *ksi_only* == yes, return only fatal and major crashes.
    '''    

    keys = list(request.args)
    area_type = request.args.get('type')
    value = request.args.get('value')
    ksi_only = request.args.get('ksi_only') 

    # if one of "type" or "value" included, the other has to be as well
    if (area_type and not value) or (value and not area_type):
        return jsonify(
            {'message': 'If either *type* or *value* is included in request, both are required'}
        ), 400

    if area_type:
        area_type = area_type.lower()
        if area_type not in ['county', 'municipality', 'geojson', 'state']:
            return jsonify(
                {'message': '*type* must be one of *county*, *municipality*, *state*, or *geojson*'}
            ), 400

    # be extra helpful to user - just checks spelling of ksi_only at this point
    for key in keys:
        if key not in ['type', 'value', 'state', 'ksi_only']:
            return jsonify(
                {'message': 'Query parameter *{}* not recognized'.format(key)}
            ), 400

    # build query incrementally, to add possible WHERE clauses before GROUP BY and 
    # to easily pass value parameter to execute in order to prevent SQL injection 
    severity_and_mode_query = """
        SELECT 
            year,
            SUM(fatality_count),
            SUM(maj_inj),
            SUM(mod_inj),
            SUM(min_inj),
            SUM(unk_inj),
            SUM(uninjured_count),
            SUM(bicycle_count),
            SUM(ped_count),
            SUM(person_count),
            count(id)
        FROM crash
    """

    collision_type_query = """
        SELECT 
            year,
            collision_type,
            count(collision_type) 
        FROM crash
    """

    if area_type == 'county':
        severity_and_mode_query += " WHERE county = %s"
        collision_type_query += " WHERE county = %s"
    elif area_type == 'municipality':
        severity_and_mode_query += " WHERE municipality = %s"
        collision_type_query += " WHERE municipality = %s"
    elif area_type == 'state':
        severity_and_mode_query += " WHERE state = %s"
        collision_type_query += " WHERE state = %s"
    elif area_type == 'geojson':
        severity_and_mode_query += " WHERE ST_WITHIN(geom,ST_GeomFromGeoJSON(%s))"
        collision_type_query += " WHERE ST_WITHIN(geom,ST_GeomFromGeoJSON(%s))"
    
    if ksi_only == 'yes':
        if area_type:
            severity_and_mode_query += " AND (fatality_count > 0 OR maj_inj > 0)"
            collision_type_query += " AND (fatality_count > 0 OR maj_inj > 0)"
        else:
            severity_and_mode_query += " WHERE (fatality_count > 0 OR maj_inj > 0)"
            collision_type_query += " WHERE (fatality_count > 0 OR maj_inj > 0)"

    severity_and_mode_query += " GROUP BY year"
    collision_type_query += " GROUP BY year, collision_type"
 
    cursor = get_db_cursor() 
   
    try:
        cursor.execute(severity_and_mode_query, [value])
    except psycopg2.Error as e:
        return jsonify({'message': 'Database error: ' + str(e)}), 400
    
    result = cursor.fetchall()
    
    if not result:
        return jsonify({'message': 'No information found for given type/value.'}), 404

    summary = {}

    for row in result:
        summary[str(row[0])] = {
            'total_crashes': row[10],
            'severity': {
                'fatal': row[1],
                'major': row[2],
                'moderate': row[3],
                'minor': row[4],
                'unknown': row[5],
                'uninjured': row[6],
            },
            'mode': {
                'bike': row[7],
                'ped': row[8],
                'vehicle_occupants': row[9] - row[8] - row[7]
            },
            'type': {},
        } 

    # now get numbers/types of collisions per year and add to summary
    
    collision_type_query = cursor.execute(collision_type_query, [value])
    result = cursor.fetchall()

    collisions_by_year = {}

    for row in result:
        try:
            collisions_by_year[str(row[0])][row[1]] = row[2]
        except KeyError:
            collisions_by_year[str(row[0])] = {}
            collisions_by_year[str(row[0])][row[1]] = row[2] 

    for k in summary.keys():
        summary[k]['type'] = collisions_by_year[k]

    return jsonify(summary)


@app.route('/api/crash-data/v1/crash-ids', methods=['GET'])
def get_crash_ids():
    '''Return list of crash_ids based on provided parameters.'''

    # @TODO: more ways to get this info in addition to by geojson

    geojson = request.args.get('geojson')
    
    if not geojson:
        return jsonify({'Message': 'Required parameter *geojson* not provided.'}), 400

    cursor = get_db_cursor()
    query = """
        SELECT id
        FROM crash
        WHERE ST_WITHIN(geom, ST_GeomFromGeoJSON(%s));
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
