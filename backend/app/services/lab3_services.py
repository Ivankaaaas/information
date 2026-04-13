import time
from app.utils.encryption_utils import EncryptionUtils, PRNG

class Lab3Service:
    def __init__(self):
        self.w = 32
        self.r = 8
        self.b = 8

    async def encrypt_file_with_time(self, content: bytes, password: str):
        start_time = time.perf_counter()
        result = await self.encrypt_file(content, password)
        end_time = time.perf_counter()
        execution_time = end_time - start_time
        
        return result, execution_time

    def encrypt_file(self, content: bytes, password: str) -> bytes:
        key = bytes.fromhex(EncryptionUtils.MD5(password))[:self.b]
        S = EncryptionUtils.rc5_key_expansion(key, self.w, self.r)
        
        prng = PRNG(seed=123)
        iv = bytes([prng.next_byte() for _ in range(8)])
        
        pad_len = 8 - (len(content) % 8)
        data = content + bytes([pad_len] * pad_len)

        res = bytearray(iv)
        prev = iv
        
        for i in range(0, len(data), 8):
            block = data[i:i+8]
            xored = bytes(a ^ b for a, b in zip(block, prev))
            cipher = EncryptionUtils.rc5_encrypt_block(xored, S, self.w, self.r)
            res.extend(cipher)
            prev = cipher
            
        return bytes(res)

    def decrypt_file(self, encrypted_content: bytes, password: str) -> bytes:
        key = bytes.fromhex(EncryptionUtils.MD5(password))[:self.b]
        S = EncryptionUtils.rc5_key_expansion(key, self.w, self.r)

        if len(encrypted_content) < 16:
            return encrypted_content

        iv = encrypted_content[:8]
        data = encrypted_content[8:]
        
        decrypted_padded = bytearray()
        prev = iv
        
        for i in range(0, len(data), 8):
            cipher_block = data[i:i+8]
            dec = EncryptionUtils.rc5_decrypt_block(cipher_block, S, self.w, self.r)
            plain = bytes(a ^ b for a, b in zip(dec, prev))
            decrypted_padded.extend(plain)
            prev = cipher_block
            
        if not decrypted_padded: return b""
        pad_len = decrypted_padded[-1]
        
        if 1 <= pad_len <= 8:
            padding_candidate = decrypted_padded[-pad_len:]
            if all(b == pad_len for b in padding_candidate):
                return bytes(decrypted_padded[:-pad_len])
        
        return bytes(decrypted_padded)

lab3_service = Lab3Service()