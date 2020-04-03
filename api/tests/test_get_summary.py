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
        query_string={'type': 'county'},
    )
    assert response.status_code == 400


def test_error_if_value_included_but_not_type(client):
    response = client.get(
        endpoint,
        query_string={'value': 'Montgomery'},
    )
    assert response.status_code == 400


def test_error_if_type_arg_not_in_required_list(client):
    response = client.get(
        endpoint,
        query_string={'type': 'not_in_the_list', 'value': 'Montgomery'}
    )
    assert response.status_code == 400


@pytest.mark.parametrize('type,value', [
    ('state', 'CA'),
    ('county', 'Allegheny'),
    ('municipality', 'Erie City')
])
def test_unknown_values_return_404(client, type, value):
    response = client.get(
        endpoint,
        query_string={'type': type, 'value': value}
    )
    assert response.status_code == 404


@pytest.mark.parametrize('type,value,ksi_only', [
    ('state', 'pa', 'no'),
    ('state', 'pa', 'yes'),
    ('state', 'nj', 'no'),
    ('state', 'nj', 'yes'),
    ('county', 'Bucks', 'no'),
    ('county', 'Bucks', 'yes'),
    ('county', 'Burlington', 'no'),
    ('county', 'Burlington', 'yes'),
    ('county', 'Camden', 'no'),
    ('county', 'Camden', 'yes'),
    ('county', 'Chester', 'no'),
    ('county', 'Chester', 'yes'),
    ('county', 'Delaware', 'no'),
    ('county', 'Delaware', 'yes'),
    ('county', 'Gloucester', 'no'),
    ('county', 'Gloucester', 'yes'),
    ('county', 'Mercer', 'no'),
    ('county', 'Mercer', 'yes'),
    ('county', 'Montgomery', 'no'),
    ('county', 'Montgomery', 'yes'),
    ('county', 'Philadelphia', 'no'),
    ('county', 'Philadelphia', 'yes'),
    ('municipality', 'West', 'no'),
    ('municipality', 'West', 'yes'),
    ('municipality', 'Mount Laurel Township', 'no'),
    ('municipality', 'Mount Laurel Township', 'yes'),
])
def test_minimal_success_by_type_and_ksi(client, type, value, ksi_only):
    response = client.get(
        endpoint,
        query_string={'type': type, 'value': value, 'ksi_only': ksi_only}
    )
    assert response.status_code == 200


@pytest.mark.parametrize('ksi_only', ['yes', 'no'])
def test_region_ksi_and_not_ksi_success(client, ksi_only):
    response = client.get(
        endpoint,
        query_string={'ksi_only': ksi_only}
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
    ('municipality', 'Abington Township'),
    ('municipality', 'Aldan Borough'),
    ('municipality', 'Ambler Borough'),
    ('municipality', 'Aston Township'),
    ('municipality', 'Atglen Borough'),
    ('municipality', 'Audubon Borough'),
    ('municipality', 'Downingtown Borough'),
    ('municipality', 'Hilltown Township'),
    ('municipality', 'Lansdowne Borough'),
    ('municipality', 'Upper North'),
    ('municipality', 'West Goshen Township'),
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


@pytest.mark.parametrize('type,value,ksi_only', [
    ('state', 'pa', ''),
    ('state', 'pa', 'yes'),
    ('state', 'nj', ''),
    ('state', 'nj', 'yes'),
    ('county', 'Bucks', ''),
    ('county', 'Bucks', 'yes'),
    ('county', 'Burlington', ''),
    ('county', 'Burlington', 'yes'),
    ('county', 'Camden', ''),
    ('county', 'Camden', 'yes'),
    ('county', 'Chester', ''),
    ('county', 'Chester', 'yes'),
    ('county', 'Delaware', ''),
    ('county', 'Delaware', 'yes'),
    ('county', 'Gloucester', ''),
    ('county', 'Gloucester', 'yes'),
    ('county', 'Mercer', ''),
    ('county', 'Mercer', 'yes'),
    ('county', 'Montgomery', ''),
    ('county', 'Montgomery', 'yes'),
    ('county', 'Philadelphia', ''),
    ('county', 'Philadelphia', 'yes'),
    ('municipality', 'West', ''),
    ('municipality', 'West', 'yes'),
])
def test_summed_collision_types_equals_total_crashes(client, type, value, ksi_only):
    response = client.get(
        endpoint,
        query_string={'type': type, 'value': value, 'ksi_only': ksi_only}
    )
    data = response.get_json()
    yr_17_sum_collisions = sum([value for value in data['2017']['type'].values()])
    yr_18_sum_collisions = sum([value for value in data['2018']['type'].values()])
    assert yr_17_sum_collisions == data['2017']['total_crashes']
    assert yr_18_sum_collisions == data['2018']['total_crashes']


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

    total_injured_18 = (
        y_18['severity']['major'] +
        y_18['severity']['moderate'] + 
        y_18['severity']['minor']
    )

    total_injured_17 = (
        y_17['severity']['major'] + 
        y_17['severity']['moderate'] + 
        y_17['severity']['minor']
    )
    assert y_17['total_crashes'] == 11825  # Data Navigator has incorrect number - 11924
    assert y_17['severity']['fatal'] == 51  # Data Navigator has incorrect number - 52
    assert y_17['mode']['bike'] == 57  # Data Nav has incorrect number - 56
    assert y_17['mode']['ped'] == 100  # Data Nav has 104
    assert total_injured_17 == 4139  # Data Nav has 4084
    assert y_18['total_crashes'] == 12237
    assert y_18['severity']['fatal'] == 43
    assert y_18['mode']['bike'] == 59
    assert y_18['mode']['ped'] == 107
    assert total_injured_18 == 3883


def test_county_numbers2(client):
    response = client.get(
        endpoint,
        query_string={'type': 'county', 'value': 'Burlington'}
    )
    data = response.get_json()
    y_17 = data['2017']
    y_18 = data['2018']
    print(data)
    assert False

