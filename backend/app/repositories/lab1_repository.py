import os
import logging
from typing import List

logger = logging.getLogger(__name__)

class Lab1Repository:
    def __init__(self, storage_path: str = "storage/project"):
        self.storage_path = storage_path
        if not os.path.exists(self.storage_path):
            os.makedirs(self.storage_path)
            logger.info(f"Created storage directory: {self.storage_path}")

    async def save_sequence(self, sequence: List[int], filename: str = "generated_sequence.txt"):
        file_path = os.path.join(self.storage_path, filename)
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                for number in sequence:
                    f.write(f"{number}\n")
            logger.debug(f"Successfully saved {len(sequence)} numbers to {file_path}")
        except Exception as e:
            logger.error(f"Failed to save sequence to file: {str(e)}")
            raise

lab1_repo = Lab1Repository()
