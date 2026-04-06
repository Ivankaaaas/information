import pytest
import os
import time
from app.services.lab4_services import lab4_service

@pytest.mark.asyncio
async def test_hybrid_flow_full_cycle():
    original_data = os.urandom(1024 * 50)
    private_pem, public_pem = lab4_service.generate_key_pair()
    
    combined, rsa_t, rc5_t = await lab4_service.encrypt_hybrid(original_data, public_pem)
    decrypted = await lab4_service.decrypt_hybrid(combined, private_pem)
    
    assert decrypted == original_data
    print("Результат: Дані ідентичні. Тест пройдено")
    assert rsa_t > 0
    assert rc5_t > 0

@pytest.mark.asyncio
async def test_encryption_with_wrong_key():
    data = b"Secret message"
    private_pem_1, public_pem_1 = lab4_service.generate_key_pair()
    private_pem_2, _ = lab4_service.generate_key_pair()
    
    combined, _, _ = await lab4_service.encrypt_hybrid(data, public_pem_1)
    
    with pytest.raises(Exception):
        await lab4_service.decrypt_hybrid(combined, private_pem_2)
    print("Результат: Система відхилила невірний ключ. Тест пройдено")

@pytest.mark.asyncio
async def test_empty_file():
    data = b""
    private_pem, public_pem = lab4_service.generate_key_pair()
    
    combined, _, _ = await lab4_service.encrypt_hybrid(data, public_pem)
    decrypted = await lab4_service.decrypt_hybrid(combined, private_pem)
    
    assert decrypted == b""
    print("Результат: Порожній файл оброблено коректно")

@pytest.mark.asyncio
async def test_large_file_size_limit():
    large_data = b"A" * 1000 
    _, public_pem = lab4_service.generate_key_pair()
    
    try:
        await lab4_service.encrypt_hybrid(large_data, public_pem)
        print("Результат: Гібридна схема успішно обійшла ліміт")
    except ValueError:
        pytest.fail("Гібридне шифрування не впоралося з даними > 190 байтів!")

@pytest.mark.asyncio
async def test_key_serialization_integrity():
    priv, pub = lab4_service.generate_key_pair()
    
    assert priv.startswith(b"-----BEGIN PRIVATE KEY-----")
    assert pub.startswith(b"-----BEGIN PUBLIC KEY-----")
    print("Результат: Ключі відповідають стандарту PEM")

@pytest.mark.asyncio
async def test_performance_comparison_rsa_vs_rc5():
    from app.services.lab4_services import lab4_service
    from app.services.lab3_services import lab3_service

    test_data = b"Comparison_Data_Block_Size_64_Bytes_For_Scientific_Performance"
    password = "test_password_123"
    

    start_rsa = time.time()
    private_key, public_key = lab4_service.generate_key_pair()
    _, rsa_internal_time = await lab4_service.encrypt_rsa(test_data, public_key)
    end_rsa = time.time()
    total_rsa_time = end_rsa - start_rsa

    start_rc5 = time.time()
    _, rc5_internal_time = await lab3_service.encrypt_file_with_time(test_data, password)
    end_rc5 = time.time()
    total_rc5_time = end_rc5 - start_rc5

    print(f"\nБенчмарк (Однакові дані: {len(test_data)} байт):")
    print(f"RSA час: {total_rsa_time:.6f} сек")
    print(f"RC5 час: {total_rc5_time:.6f} сек")

    assert total_rsa_time > 0
    assert total_rc5_time > 0