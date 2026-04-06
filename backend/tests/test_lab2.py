import pytest
import io
import time
from fastapi.testclient import TestClient
from app.main import app
from backend.app.utils.encryption_utils import EncryptionUtils

client = TestClient(app)

@pytest.mark.parametrize("input_str, expected_hash", [
    ("", "d41d8cd98f00b204e9800998ecf8427e"),
    ("a", "0cc175b9c0f1b6a831c399e269772661"),
    ("abc", "900150983cd24fb0d6963f7d28e17f72"),
    ("message digest", "f96b697d7cb7938d525a2f31aaf161d0"),
    ("abcdefghijklmnopqrstuvwxyz", "c3fcd3d76192e4007dfb496cca67e13b"),
    ("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", "d174ab98d277d9f5a5611c2c9f419d9f")
])
def test_md5_rfc_vectors(input_str, expected_hash):
    assert EncryptionUtils.MD5(input_str) == expected_hash

def test_verify_integrity_logic():
    content = b"Data for lab report 2"
    correct_hash = EncryptionUtils.MD5_bytes(content)
    
    response = client.post(
        "/api/v1/lab2/verify",
        files={
            "target_file": ("test.txt", io.BytesIO(content)),
            "hash_file": ("hash.txt", io.BytesIO(correct_hash.encode()))
        }
    )
    assert response.status_code == 200
    assert response.json()["valid"] is True

    response = client.post(
        "/api/v1/lab2/verify",
        files={
            "target_file": ("test.txt", io.BytesIO(content + b" ")),
            "hash_file": ("hash.txt", io.BytesIO(correct_hash.encode()))
        }
    )
    assert response.json()["valid"] is False

def test_md5_performance():
    data = b"performance test" * 1000
    start_time = time.time()
    EncryptionUtils.MD5_bytes(data)
    end_time = time.time()
    duration = end_time - start_time
    print(f"\nPerformance: {duration:.5f}s")
    assert duration < 0.1 

def test_large_file_hashing():
    large_data = b"0" * (1024 * 1024)
    response = client.post(
        "/api/v1/lab2/hash/file",
        files={"file": ("large.bin", io.BytesIO(large_data))}
    )
    assert response.status_code == 200
    assert len(response.json()["hash"]) == 32
    