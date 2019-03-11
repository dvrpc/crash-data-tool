"""
author: Robert Beatty
date: March 11, 2019
purpose: simple REST API to retrieve summary information in DVRPC's crash data tool
"""


from flask import Flask, request
from flask_cors import CORS
from lib import credentials
import psycopg2 as psql
from psycopg2 import sql
import json



app = Flask(__name__)
CORS(app)

def connectToPsql():
    return psql.connect(credentials.PSQL_CREDS)

"""
@TODO:  create documentation page using flask's render_template function to deliver an HTML file
        to give details about how to use the API
"""
@app.route('/api/crash-data/v1/documentation')
def docs():
    return '<html><p>this will be the docs page</p></html>'


@app.route('/api/crash-data/v1/popupInfo', methods=["GET"])
def get_popup_info():
    ## grab crash id
    id = request.args.get('id')


    ## connect to db
    con = connectToPsql()
    cur = con.cursor()
    qry = """
    SELECT 
        pa_crash.month,
        pa_crash.year,
        pa_type.vehicle_count,
        pa_type.bicycle,
        pa_type.ped,
        pa_type.vehicle_occupancy
    FROM pa_crash
    JOIN 
        pa_severity ON pa_crash.crash_id = pa_severity.crash_id
    JOIN 
        pa_type ON pa_crash.crash_id = pa_type.crash_id
    WHERE 
        pa_crash.crash_id = {0};
"""
    """
        skeleton for json return
        payload['status']: {
            'status': (success|failed) -- whether or not the query was received in proper format
            'message': string -- message describing what happened once the request was received
        }
        payload['features']: []
            -- if there is an item in the array, then the 
    """
    payload = {
        'status': {
            'status': 'pending...',
            'message': 'function is running'
        },
        'features': []
    }

    ## is the CRN there?
    if id is not None:
        ## success message
        payload['status'] = {
            'status': 'success',
            'message': 'received request for crash_id {}'.format(id)
        }
        ## try/except block for query
        try:
            cur.execute(sql.SQL(qry.format(id)))
            for row in cur.fetchall():
                result = {
                    'month': row[0],
                    'year': row[1],
                    'vehicle_count': row[2],
                    'bike': row[3],
                    'ped': row[4],
                    'persons': row[5]
                }
                payload['features'].append(result)
        ## alter payload status/message if query fails
        except Exception as e:
            payload['status'] = {
                'status': 'failed',
                'message': 'query input was received, but the query failed. Error Message: {0}'.format(e)
            }
    ## alter payload message for invalid query
    else:
        payload['status'] = {
           'status': 'failed',
           'message': 'Error: not crash id supplied'
        }
    return json.dumps(payload, indent=4)

