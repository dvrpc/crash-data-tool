import pytest

'''
Testing get_summary()
'''

endpoint = '/api/crash-data/v1/summary'


@pytest.mark.parametrize('area,value', [
    ('state', 'CA'),
    ('county', 'Allegheny'),
    ('municipality', 'Erie City'),
    ('geoid', 5454554)
])
def test_unknown_values_return_404(client, area, value):
    response = client.get(endpoint + f'?{area}={value}')
    data = response.json() 
    print(data)
    assert response.status_code == 404
    assert data['message'] == "No information found for given parameters"


@pytest.mark.parametrize('area,value,ksi_only', [
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
    ('geoid', '42', 'no'),
    ('geoid', '34', 'yes'),
    ('geoid', '42017', 'no'),
    ('geoid', '42017', 'yes'),
    ('geoid', '42029', 'yes'),
    ('geoid', '42029', 'no'),
    ('geoid', '34015', 'yes'),
    ('geoid', '34015', 'no'),
    ('geoid', '34007', 'yes'),
    ('geoid', '34007', 'no'),
])
def test_minimal_success_by_type_and_ksi(client, area, value, ksi_only):
    response = client.get(endpoint + f'?{area}={value}&ksi_only={ksi_only}')
    assert response.status_code == 200


@pytest.mark.parametrize('ksi_only', ['yes', 'no'])
def test_region_ksi_and_not_ksi_success(client, ksi_only):
    response = client.get(endpoint + f'?ksi_only={ksi_only}')
    assert response.status_code == 200


@pytest.mark.parametrize('value', ['Camden City', 'Mount Laurel Township'])
def test_double_spacing(client, value):
    '''
    Test that double-spacing error is fixed (some municipalities and counties had two spaces
    between words rather than one).
    '''
    response = client.get(endpoint + f'?municipality={value}')
    assert response.status_code == 200


@pytest.mark.parametrize('area,value', [
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
def test_KSI_only1(client, area, value):
    '''
    If requesting KSI crashes only, every year/severity should always have either a fatal or 
    major value. 
    '''
    response = client.get(endpoint + f'?{area}={value}&ksi_only=yes')
    data = response.json()
    fatal_and_major_values = []
    for k, v in data.items():
        fatal_and_major_values.append([v['severity']['fatal'], v['severity']['major']])

    print(fatal_and_major_values)  # only prints if tests fails
    # the inner any() creates a list of either True or False values (if either value is Truthy -
    # i.e. above zero - value will be True) and the outer all() then checks that they are all True.
    assert all([any(value_set) for value_set in fatal_and_major_values])


@pytest.mark.parametrize('area,value,ksi_only', [
    # ('state', 'pa', 'no'),
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
    ('geoid', '42045', 'no'),
    ('geoid', '42045', 'yes'),
    ('geoid', '42091', 'no'),
    ('geoid', '42091', 'yes'),
    ('geoid', '34005', 'no'),
    ('geoid', '34005', 'yes'),
    ('geoid', '34021', 'no'),
    ('geoid', '34021', 'yes'),
])
def test_summed_collision_types_equals_total_crashes(client, area, value, ksi_only):
    response = client.get(endpoint + f'?{area}={value}&ksi_only={ksi_only}')
    data = response.json()
    yr_17_sum_collisions = sum([value for value in data['2017']['type'].values()])
    yr_18_sum_collisions = sum([value for value in data['2018']['type'].values()])
    assert yr_17_sum_collisions == data['2017']['total crashes']
    assert yr_18_sum_collisions == data['2018']['total crashes']


###################
# COMPARING TO DB # 
###################


def test_data_Chadds_Ford(client):
    '''Make sure that the renaming worked properly.'''
    response = client.get(endpoint + '?municipality=Chadds Ford Township')
    data = response.json()
    y_14 = data['2014']
    y_18 = data['2018']
    
    total_injured_14 = (
        y_14['severity']['major'] +
        y_14['severity']['moderate'] + 
        y_14['severity']['minor'] +
        y_14['severity']['unknown severity']
    )

    total_injured_18 = (
        y_18['severity']['major'] + 
        y_18['severity']['moderate'] + 
        y_18['severity']['minor'] +
        y_18['severity']['unknown severity']
    )
    assert y_14['total crashes'] == 86
    assert y_14['severity']['fatal'] == 1 
    assert y_14['severity']['unknown if injured'] == 6
    assert y_14['mode']['bike'] == 0
    assert y_14['mode']['ped'] == 0
    assert total_injured_14 == 65
    assert y_18['total crashes'] == 79
    assert y_18['severity']['fatal'] == 0
    assert y_18['severity']['unknown if injured'] == 4
    assert y_18['mode']['bike'] == 0
    assert y_18['mode']['ped'] == 1
    assert total_injured_18 == 50


def test_data_Burlington(client):
    response = client.get(endpoint + '?county=Burlington')
    data = response.json()
    y_17 = data['2017']
    y_18 = data['2018']

    total_injured_18 = (
        y_18['severity']['major'] +
        y_18['severity']['moderate'] + 
        y_18['severity']['minor'] +
        y_18['severity']['unknown severity']
    )

    total_injured_17 = (
        y_17['severity']['major'] + 
        y_17['severity']['moderate'] + 
        y_17['severity']['minor'] +
        y_17['severity']['unknown severity']
    )
    assert y_17['total crashes'] == 11825  
    assert y_17['severity']['fatal'] == 51  
    assert y_17['mode']['bike'] == 57  
    assert y_17['mode']['ped'] == 100  
    assert total_injured_17 == 4139  
    assert y_18['total crashes'] == 12237
    assert y_18['severity']['fatal'] == 43
    assert y_18['mode']['bike'] == 59
    assert y_18['mode']['ped'] == 107
    assert total_injured_18 == 3883


def test_data_Camden(client):
    response = client.get(endpoint + '?county=Camden')
    data = response.json()
    y_17 = data['2017']
    y_18 = data['2018']

    total_injured_18 = (
        y_18['severity']['major'] +
        y_18['severity']['moderate'] + 
        y_18['severity']['minor'] +
        y_18['severity']['unknown severity']
    )

    total_injured_17 = (
        y_17['severity']['major'] + 
        y_17['severity']['moderate'] + 
        y_17['severity']['minor'] +
        y_17['severity']['unknown severity']
    )
    assert y_17['total crashes'] == 15179
    assert y_17['severity']['fatal'] == 47 
    assert y_17['mode']['bike'] == 109 
    assert y_17['mode']['ped'] == 268 
    assert total_injured_17 == 5623 
    assert y_18['total crashes'] == 15758
    assert y_18['severity']['fatal'] == 49
    assert y_18['mode']['bike'] == 122
    assert y_18['mode']['ped'] == 260
    assert total_injured_18 == 5763


def test_data_Gloucester(client):
    response = client.get(endpoint + '?county=Gloucester')
    data = response.json()
    y_17 = data['2017']
    y_18 = data['2018']

    total_injured_18 = (
        y_18['severity']['major'] +
        y_18['severity']['moderate'] + 
        y_18['severity']['minor'] +
        y_18['severity']['unknown severity']
    )

    total_injured_17 = (
        y_17['severity']['major'] + 
        y_17['severity']['moderate'] + 
        y_17['severity']['minor'] +
        y_17['severity']['unknown severity']
    )
    assert y_17['total crashes'] == 7517
    assert y_17['severity']['fatal'] == 46 
    assert y_17['mode']['bike'] == 34 
    assert y_17['mode']['ped'] == 61 
    assert total_injured_17 == 2635 
    assert y_18['total crashes'] == 7715
    assert y_18['severity']['fatal'] == 40
    assert y_18['mode']['bike'] == 39
    assert y_18['mode']['ped'] == 65
    assert total_injured_18 == 2538


def test_data_PA(client):
    response = client.get(endpoint + '?state=pa')
    data = response.json()
    y_14 = data['2014']
    y_15 = data['2015']
    y_16 = data['2016']
    y_17 = data['2017']
    y_18 = data['2018']

    total_injured_18 = (
        y_18['severity']['major'] +
        y_18['severity']['moderate'] + 
        y_18['severity']['minor'] + 
        y_18['severity']['unknown severity']
    )
    total_injured_17 = (
        y_17['severity']['major'] + 
        y_17['severity']['moderate'] + 
        y_17['severity']['minor'] +
        y_17['severity']['unknown severity']
    )
    total_injured_16 = (
        y_16['severity']['major'] + 
        y_16['severity']['moderate'] + 
        y_16['severity']['minor'] +
        y_16['severity']['unknown severity']
    )
    total_injured_15 = (
        y_15['severity']['major'] + 
        y_15['severity']['moderate'] + 
        y_15['severity']['minor'] + 
        y_15['severity']['unknown severity']
    )
    total_injured_14 = (
        y_14['severity']['major'] + 
        y_14['severity']['moderate'] + 
        y_14['severity']['minor'] +
        y_14['severity']['unknown severity']
    )
    assert y_14['total crashes'] == 33740 
    assert y_14['severity']['fatal'] == 239
    assert y_14['severity']['major'] == 637
    assert y_14['severity']['moderate'] == 3039
    assert y_14['severity']['minor'] == 12223
    assert y_14['severity']['unknown severity'] == 9764
    assert y_14['mode']['bike'] == 720
    assert y_14['mode']['ped'] == 2198
    assert y_14['mode']['vehicle occupants'] == 83251 - 720 - 2198 
    assert total_injured_14 == 25663
    assert y_15['total crashes'] == 35786
    assert y_15['severity']['fatal'] == 240
    assert y_15['severity']['major'] == 736
    assert y_15['severity']['moderate'] == 3194
    assert y_15['severity']['minor'] == 12534
    assert y_15['severity']['unknown severity'] == 10531
    assert y_15['mode']['bike'] == 687
    assert y_15['mode']['ped'] == 2181
    assert y_15['mode']['vehicle occupants'] == 88825 - 2181 - 687
    assert total_injured_15 == 26995
    assert y_16['total crashes'] == 37048
    assert y_16['severity']['fatal'] == 238
    assert y_16['severity']['major'] == 995
    assert y_16['severity']['moderate'] == 6199
    assert y_16['severity']['minor'] == 9827
    assert y_16['severity']['unknown severity'] == 11073
    assert y_16['mode']['bike'] == 680
    assert y_16['mode']['ped'] == 2403
    assert y_16['mode']['vehicle occupants'] == 92423 - 2403 - 680
    assert total_injured_16 == 28094  # db has 28102, but sum of components is 28094
    assert y_17['total crashes'] == 36192
    assert y_17['severity']['fatal'] == 245
    assert y_17['severity']['major'] == 969
    assert y_17['severity']['moderate'] == 6605
    assert y_17['severity']['minor'] == 9225
    assert y_17['severity']['unknown severity'] == 10075
    assert y_17['mode']['bike'] == 618
    assert y_17['mode']['ped'] == 2253
    assert y_17['mode']['vehicle occupants'] == 89206 - 618 - 2253
    assert total_injured_17 == 26874  # db has 26884, but sum of components is 26874
    assert y_18['total crashes'] == 36306
    assert y_18['severity']['fatal'] == 272
    assert y_18['severity']['major'] == 1014
    assert y_18['severity']['moderate'] == 8380
    assert y_18['severity']['minor'] == 7437
    assert y_18['severity']['unknown severity'] == 9294
    assert y_18['mode']['bike'] == 489
    assert y_18['mode']['ped'] == 2272
    assert y_18['mode']['vehicle occupants'] == 88096 - 489 - 2272
    assert total_injured_18 == 26125  # db has 26129, but sum of components is 29125

