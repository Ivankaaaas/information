from fastapi import UploadFile, HTTPException
from app.utils.encryption_utils import EncryptionUtils

class Lab2Service:
    def compute_md5_string(self, text: str) -> str:
        return EncryptionUtils.MD5(text)

    async def compute_md5_file(self, file: UploadFile) -> str:
        try:
            await file.seek(0) 
            content = await file.read()
            return EncryptionUtils.MD5_bytes(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

    async def verify_integrity(self, target_file: UploadFile, hash_file: UploadFile) -> dict:
        actual_hash = await self.compute_md5_file(target_file)
        
        await hash_file.seek(0)
        expected_hash_bytes = await hash_file.read()
        try:
            expected_hash = expected_hash_bytes.decode('utf-8').strip().lower()
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="Hash file must be a valid text file")

        is_valid = actual_hash.lower() == expected_hash
        
        return {
            "valid": is_valid,
            "actual_hash": actual_hash,
            "expected_hash": expected_hash,
            "filename": target_file.filename
        }

lab2_service = Lab2Service()
