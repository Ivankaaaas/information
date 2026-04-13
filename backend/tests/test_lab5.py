import pytest
import io
from fastapi.testclient import TestClient
from app.main import app
from app.services.lab5_services import lab5_service

client = TestClient(app)

@pytest.mark.asyncio
async def test_lab5_full_cycle():
    response_keys = client.get("/api/v1/lab5/keys/generate")
    assert response_keys.status_code == 200
    keys = response_keys.json()
    private_key = keys["private_key"]
    public_key = keys["public_key"]
    assert "BEGIN PRIVATE KEY" in private_key
    assert "BEGIN PUBLIC KEY" in public_key

    test_content = b"Data for Digital Signature Lab 5"
    file_name = "test_lab5.txt"
    
    response_sign = client.post(
        "/api/v1/lab5/sign",
        data={"private_key": private_key},
        files={"file": (file_name, io.BytesIO(test_content))}
    )
    assert response_sign.status_code == 200
    sign_data = response_sign.json()
    signature_hex = sign_data["signature_hex"]
    assert len(signature_hex) > 0

    response_verify = client.post(
        "/api/v1/lab5/verify",
        data={
            "signature_hex": signature_hex,
            "public_key": public_key
        },
        files={"file": (file_name, io.BytesIO(test_content))}
    )
    assert response_verify.status_code == 200
    assert response_verify.json()["is_valid"] is True

    response_verify_fail = client.post(
        "/api/v1/lab5/verify",
        data={
            "signature_hex": signature_hex,
            "public_key": public_key
        },
        files={"file": (file_name, io.BytesIO(test_content + b" corrupted"))}
    )
    assert response_verify_fail.json()["is_valid"] is False

@pytest.mark.asyncio
async def test_sign_with_invalid_key():
    invalid_key = "NOT_A_REAL_KEY"
    file_content = b"Some data"
    
    response = client.post(
        "/api/v1/lab5/sign",
        data={"private_key": invalid_key},
        files={"file": ("test.txt", io.BytesIO(file_content))}
    )
    assert response.status_code != 200

@pytest.mark.asyncio
async def test_empty_file_signature():
    keys = client.get("/api/v1/lab5/keys/generate").json()
    
    response_sign = client.post(
        "/api/v1/lab5/sign",
        data={"private_key": keys["private_key"]},
        files={"file": ("empty.txt", io.BytesIO(b""))}
    )
    assert response_sign.status_code == 200
    signature = response_sign.json()["signature_hex"]
    
    response_verify = client.post(
        "/api/v1/lab5/verify",
        data={
            "signature_hex": signature,
            "public_key": keys["public_key"]
        },
        files={"file": ("empty.txt", io.BytesIO(b""))}
    )
    assert response_verify.json()["is_valid"] is True

@pytest.mark.asyncio
async def test_verify_with_wrong_signature():
    keys = client.get("/api/v1/lab5/keys/generate").json()
    content = b"Original content"
    
    fake_signature = "a" * 128 
    
    response = client.post(
        "/api/v1/lab5/verify",
        data={
            "signature_hex": fake_signature,
            "public_key": keys["public_key"]
        },
        files={"file": ("test.txt", io.BytesIO(content))}
    )
    assert response.status_code == 200
    assert response.json()["is_valid"] is False
