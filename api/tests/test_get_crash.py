import pytest

endpoint = "/api/crash-data/v1/crashes/"  # <id>


def test_404_when_bad_id_param_provided(client):
    response = client.get(endpoint + "1")
    assert response.status_code == 404


def test_id_success1(client):
    response = client.get(endpoint + "2016000784")
    assert response.status_code == 200


def test_id_data_correct1(client):
    response = client.get(endpoint + "201808052018-34718")
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


@pytest.mark.parametrize(
    "id,expected_max_severity",
    [
        ("2014075953", "no fatality or injury"),
        ("2015077824", "minor injury"),
        ("2015107449", "moderate injury"),
        ("2016004173", "major injury"),
        ("2016004153", "fatality"),
        ("2016004167", "unknown injury"),
    ],
)
def test_max_severity(client, id, expected_max_severity):
    response = client.get(endpoint + id)
    data = response.json()
    assert data["max_severity"] == expected_max_severity
