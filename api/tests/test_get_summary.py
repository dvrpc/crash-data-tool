import pytest

'''
Testing get_summary()
'''

endpoint = '/api/crash-data/v1/summary'


def test_error_on_unknown_params(client):
    response = client.get(
        endpoint,
        query_string={'one': '1'},
    )
    assert response.status_code == 400


def test_error_if_type_included_but_not_value(client):
    response = client.get(
        endpoint,
        query_string={'type': '1'},
    )
    assert response.status_code == 400


def test_error_if_value_included_but_not_type(client):
    response = client.get(
        endpoint,
        query_string={'value': '1'},
    )
    assert response.status_code == 400


def test_type_arg_not_in_required_list(client):
    response = client.get(
        endpoint,
        query_string={'type': 'not_in_the_list', 'value': 'Montgomery'}
    )
    assert response.status_code == 400


def test_success1(client):
    response = client.get(
        endpoint,
        query_string={'type': 'county', 'value': 'Montgomery'}
    )
    assert response.status_code == 200


@pytest.mark.parametrize('value', ['pa', 'nj'])
def test_success2(client, value):
    response = client.get(
        endpoint,
        query_string={'type': 'state', 'value': value}
    )
    assert response.status_code == 200


@pytest.mark.parametrize('value', ['Camden City', 'Mount Laurel Township'])
def test_double_spacing(client, value):
    '''
    Test that double-spacing error is fixed (some municipalities and counties had two spaces
    between words rather than one).
    '''
    response = client.get(
        endpoint,
        query_string={'type': 'municipality', 'value': value}
    )

    assert response.status_code == 200


@pytest.mark.parametrize('type,value', [
    ('county', 'Bucks'), 
    ('county', 'Montgomery'),
    ('municipality', 'Hilltown Township'),
    ('municipality', 'Lansdowne Borough'),
    ('municipality', 'West Goshen Township'),
    ('municipality', 'Downingtown Borough'),
])
def test_KSI_only1(client, type, value):
    '''
    If requesting KSI crashes only, every year/severity should always have either a fatal or 
    major value. 
    '''
    response = client.get(
        endpoint,
        query_string={
            'type': type, 
            'value': value,
            'ksi_only': 'yes'
        }
    )
    data = response.get_json()
    fatal_and_major_values = []
    for k, v in data.items():
        fatal_and_major_values.append([v['severity']['fatal'], v['severity']['major']])

    print(fatal_and_major_values)  # only prints if tests fails
    # the inner any() creates a list of either True or False values (if either value is Truthy -
    # i.e. above zero - value will be True) and the outer all() then checks that they are all True.
    assert all([any(value_set) for value_set in fatal_and_major_values])


#######################################
# COMPARING NUMBERS TO DATA NAVIGATOR #
#######################################


def test_county_numbers1(client):
    response = client.get(
        endpoint,
        query_string={'type': 'county', 'value': 'Burlington'},
    )
    data = response.get_json()
    y_17 = data['2017']
    y_18 = data['2018']

    total_injured_18 = (y_18['severity']['major'] + 
        y_18['severity']['moderate'] + 
        y_18['severity']['minor'])
    print(y_18['severity'])
    assert (y_18['severity']['fatal'] == 43 and 
            y_18['mode']['bike'] == 59 and
            y_18['mode']['ped'] == 107 and
            total_injured_18 == 3883)


def test_county_numbers2(client):
    response = client.get(
        endpoint,
        query_string={'type': 'county', 'value': 'Burlington'}
    )
    data = response.get_json()
    y_17 = data['2017']
    y_18 = data['2018']
    print(y_18['type'])
    assert False

