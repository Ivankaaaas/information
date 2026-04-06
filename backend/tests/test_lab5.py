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