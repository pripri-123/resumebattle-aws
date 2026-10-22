import os
import uuid
from abc import ABC, abstractmethod
from pathlib import Path
from flask import current_app

class StorageService(ABC):
    @abstractmethod
    def save_document(self, file_bytes: bytes, original_filename: str, content_type: str) -> str:
        """Saves a document and returns a unique storage key."""
        pass

    @abstractmethod
    def get_document(self, storage_key: str) -> bytes:
        """Retrieves document bytes by storage key."""
        pass

    @abstractmethod
    def delete_document(self, storage_key: str) -> bool:
        """Deletes document by storage key."""
        pass

    @abstractmethod
    def create_download_url(self, storage_key: str, expires_in: int = 3600) -> str:
        """Returns a secure download URL or route."""
        pass

    @abstractmethod
    def document_exists(self, storage_key: str) -> bool:
        """Checks if a document exists."""
        pass


class LocalStorageService(StorageService):
    def __init__(self, base_dir: str = None):
        if not base_dir:
            base_dir = current_app.config.get("LOCAL_STORAGE_DIR") if current_app else "storage_uploads"
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _resolve_path(self, storage_key: str) -> Path:
        # Prevent directory traversal attacks
        safe_key = Path(storage_key).name
        return self.base_dir / safe_key

    def save_document(self, file_bytes: bytes, original_filename: str, content_type: str) -> str:
        ext = Path(original_filename).suffix.lower()
        storage_key = f"{uuid.uuid4().hex}{ext}"
        target_path = self._resolve_path(storage_key)
        with open(target_path, "wb") as f:
            f.write(file_bytes)
        return storage_key

    def get_document(self, storage_key: str) -> bytes:
        target_path = self._resolve_path(storage_key)
        if not target_path.exists():
            raise FileNotFoundError(f"Document {storage_key} not found in local storage.")
        with open(target_path, "rb") as f:
            return f.read()

    def delete_document(self, storage_key: str) -> bool:
        target_path = self._resolve_path(storage_key)
        if target_path.exists():
            target_path.unlink()
            return True
        return False

    def create_download_url(self, storage_key: str, expires_in: int = 3600) -> str:
        # Returns local API download path
        return f"/api/v1/documents/raw/{storage_key}"

    def document_exists(self, storage_key: str) -> bool:
        return self._resolve_path(storage_key).exists()


class S3StorageService(StorageService):
    """
    AWS S3 Storage Adapter.
    Ready for Amazon S3 with SSE-S3/KMS, private buckets, and pre-signed URLs.
    Does not execute live calls unless credentials and S3_BUCKET_NAME are configured.
    """
    def __init__(self, bucket_name: str = None, region: str = "us-east-1"):
        self.bucket_name = bucket_name or (current_app.config.get("S3_BUCKET_NAME") if current_app else "")
        self.region = region or (current_app.config.get("AWS_REGION") if current_app else "us-east-1")
        self._s3_client = None

    def _get_client(self):
        if not self._s3_client:
            try:
                import boto3
                self._s3_client = boto3.client("s3", region_name=self.region)
            except Exception as e:
                raise RuntimeError(
                    f"AWS Boto3 S3 client could not be initialized. Ensure boto3 is installed and AWS credentials are set: {e}"
                )
        return self._s3_client

    def save_document(self, file_bytes: bytes, original_filename: str, content_type: str) -> str:
        if not self.bucket_name:
            raise ValueError("S3_BUCKET_NAME environment variable is not configured.")
        client = self._get_client()
        ext = Path(original_filename).suffix.lower()
        storage_key = f"resumes/{uuid.uuid4().hex}{ext}"
        client.put_object(
            Bucket=self.bucket_name,
            Key=storage_key,
            Body=file_bytes,
            ContentType=content_type,
            ServerSideEncryption="AES256"
        )
        return storage_key

    def get_document(self, storage_key: str) -> bytes:
        client = self._get_client()
        response = client.get_object(Bucket=self.bucket_name, Key=storage_key)
        return response["Body"].read()

    def delete_document(self, storage_key: str) -> bool:
        client = self._get_client()
        client.delete_object(Bucket=self.bucket_name, Key=storage_key)
        return True

    def create_download_url(self, storage_key: str, expires_in: int = 3600) -> str:
        client = self._get_client()
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket_name, "Key": storage_key},
            ExpiresIn=expires_in
        )

    def document_exists(self, storage_key: str) -> bool:
        client = self._get_client()
        try:
            client.head_object(Bucket=self.bucket_name, Key=storage_key)
            return True
        except Exception:
            return False


def get_storage_service() -> StorageService:
    backend = current_app.config.get("STORAGE_BACKEND", "local") if current_app else "local"
    if backend == "s3":
        return S3StorageService()
    return LocalStorageService()
