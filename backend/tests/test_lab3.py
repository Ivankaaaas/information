import pytest
import asyncio
from app.utils.encryption_utils import EncryptionUtils
from app.services.lab3_services import lab3_service

W, R, B = 32, 8, 8

def test_rc5_key_expansion():
    key = b"8bytekey"
    
    S = EncryptionUtils.rc5_key_expansion(key, W, R)

    assert len(S) == 18
    assert any(x != 0 for x in S)

def test_rc5_block_consistency():
    key = b"8bytekey"
    S = EncryptionUtils.rc5_key_expansion(key, W, R)
    original_block = b"secret_8"
    
    encrypted = EncryptionUtils.rc5_encrypt_block(original_block, S, W, R)
    decrypted = EncryptionUtils.rc5_decrypt_block(encrypted, S, W, R)
    
    assert encrypted != original_block
    assert decrypted == original_block

@pytest.mark.asyncio
async def test_full_encryption_decryption_cycle():
    password = "MySecurePassword123"
    original_data = b"Hello, this is a secret message for Lab 3 testing!"
    
    encrypted_data = await lab3_service.encrypt_file(original_data, password)
    
    assert len(encrypted_data) > len(original_data)
    assert encrypted_data != original_data
    
    decrypted_data = await lab3_service.decrypt_file(encrypted_data, password)
    
    assert decrypted_data == original_data

@pytest.mark.asyncio
async def test_wrong_password_failure():
    password = "correct_password"
    wrong_password = "wrong_password"
    original_data = b"Top secret information"
    
    encrypted_data = await lab3_service.encrypt_file(original_data, password)
    
    try:
        decrypted_data = await lab3_service.decrypt_file(encrypted_data, wrong_password)
        assert decrypted_data != original_data
    except Exception:
        pass

def test_padding_logic():
    password = "Temporary_Test_Pass_99!_@#"
    data = b"123"
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    encrypted = loop.run_until_complete(lab3_service.encrypt_file(data, password))
    loop.close()
    
    assert len(encrypted) % 8 == 0
    assert len(encrypted) == 16
