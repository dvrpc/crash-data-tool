import pytest
from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    c = app.test_client()
    return c
