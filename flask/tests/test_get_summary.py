import pytest

'''
Testing get_sidebar_info()
'''

endpoint = '/api/crash-data/v1/summary'


def test_type_and_value_required_1(client):
    response = client.get(
        endpoint,
        query_string={'one': '1'},
    )
    assert response.status_code == 400


def test_type_and_value_required_2(client):
    response = client.get(
        endpoint,
        query_string={'type': '1'},
    )
    assert response.status_code == 400


def test_type_and_value_required_3(client):
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

    # print(response.data)
    # assert False
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


def test_the_actual_numbers_output_by_get_summary():
    '''Query needs to be rewritten.'''
    assert False
