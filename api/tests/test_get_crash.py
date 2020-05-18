import pytest

endpoint = "/api/crash-data/v1/crashes/"  # <id>


def test_404_when_bad_id_param_provided(client):
    response = client.get(endpoint + "1")
    assert response.status_code == 404


def test_id_success1(client):
    response = client.get(endpoint + "PA2016000784")
    assert response.status_code == 200


def test_data_correct1(client):
    response = client.get(endpoint + "NJ201808052018-34718")
    data = response.json()
    assert len(data) == 10
    assert data["month"] == "December"
    assert data["year"] == 2018
    assert data["vehicle_count"] == 1
    assert data["bicycle_count"] == 1
    assert data["bicycle_fatalities"] == 1
    assert data["ped_count"] == 0
    assert data["ped_fatalities"] == 0
    assert data["vehicle_occupants"] == 1
    assert data["collision_type"] == "Hit pedestrian"


def test_data_correct2(client):
    response = client.get(endpoint + "NJ201403042014-489")
    data = response.json()
    assert len(data) == 10
    assert data["month"] == "January"
    assert data["year"] == 2014
    assert data["vehicle_count"] == 2
    assert data["bicycle_count"] == 0
    assert data["bicycle_fatalities"] == 0
    assert data["ped_count"] == 0
    assert data["ped_fatalities"] == 0
    assert data["vehicle_occupants"] == 2
    assert data["collision_type"] == "Angle"


@pytest.mark.parametrize(
    "id,expected_max_severity",
    [
        ("PA2014075953", "no fatality or injury"),
        ("PA2015077824", "minor injury"),
        ("PA2015107449", "moderate injury"),
        ("PA2016004173", "major injury"),
        ("PA2016004153", "fatality"),
        ("PA2016004167", "unknown injury"),
    ],
)
def test_max_severity(client, id, expected_max_severity):
    response = client.get(endpoint + id)
    data = response.json()
    assert data["max_severity"] == expected_max_severity
