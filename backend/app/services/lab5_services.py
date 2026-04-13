import time
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import dsa
from cryptography.hazmat.primitives import serialization

class Lab5Service:
    def generate_dsa_keys(self):
        private_key = dsa.generate_private_key(key_size=2048)
        public_key = private_key.public_key()

        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return private_pem, public_pem

    def sign_data(self, data: bytes, private_key_pem: bytes):
        start_time = time.time()
        
        private_key = serialization.load_pem_private_key(private_key_pem, password=None)
        
        signature = private_key.sign(data, hashes.SHA256())
        
        duration = time.time() - start_time
        return signature.hex(), duration

    def verify_signature(self, data: bytes, signature_hex: bytes, public_key_pem: bytes):
        start_time = time.time()
        try:
            public_key = serialization.load_pem_public_key(public_key_pem)
            signature = bytes.fromhex(signature_hex.decode())
            
            public_key.verify(signature, data, hashes.SHA256())
            is_valid = True
        except Exception:
            is_valid = False
            
        duration = time.time() - start_time
        return is_valid, duration

lab5_service = Lab5Service()
