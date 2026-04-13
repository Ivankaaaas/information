import time
import os
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes
from app.services.lab3_services import lab3_service

class Lab4Service:
    def __init__(self):
        self.key_size = 2048
        self.rsa_output_size = 256 

    def generate_key_pair(self):
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=self.key_size
        )
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

    def encrypt_rsa(self, data: bytes, public_key_pem: bytes):
        public_key = serialization.load_pem_public_key(public_key_pem)
        start_time = time.perf_counter()
        
        ciphertext = public_key.encrypt(
            data,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        
        end_time = time.perf_counter()
        return ciphertext, end_time - start_time

    async def encrypt_hybrid(self, file_content: bytes, public_key_pem: bytes):
        session_password = os.urandom(16).hex()
        
        encrypted_password, rsa_time = await self.encrypt_rsa(
            session_password.encode(), 
            public_key_pem
        )
        
        encrypted_file, rc5_time = await lab3_service.encrypt_file_with_time(
            file_content, 
            session_password
        )
        
        combined_data = encrypted_password + encrypted_file
        
        return combined_data, rsa_time, rc5_time

    async def decrypt_hybrid(self, combined_data: bytes, private_key_pem: bytes):
        encrypted_password = combined_data[:self.rsa_output_size]
        encrypted_file = combined_data[self.rsa_output_size:]
        
        private_key = serialization.load_pem_private_key(private_key_pem, password=None)
        session_password_bytes = private_key.decrypt(
            encrypted_password,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        session_password = session_password_bytes.decode()
        
        original_content = await lab3_service.decrypt_file(
            encrypted_file, 
            session_password
        )
        
        return original_content

lab4_service = Lab4Service()
