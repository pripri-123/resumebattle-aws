import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "resume-battle-2-super-secret-dev-key-2026")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", f"sqlite:///{BASE_DIR / 'resume_battle.db'}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Storage configuration
    STORAGE_BACKEND = os.environ.get("STORAGE_BACKEND", "local")  # 'local' or 's3'
    LOCAL_STORAGE_DIR = os.environ.get("LOCAL_STORAGE_DIR", str(BASE_DIR / "storage_uploads"))
    AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
    S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME", "")
    
    # AI provider configuration
    AI_PROVIDER = os.environ.get("AI_PROVIDER", "local")  # 'local' or 'bedrock'
    BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")
    
    # Background job configuration
    BACKGROUND_JOB_BACKEND = os.environ.get("BACKGROUND_JOB_BACKEND", "local")  # 'local' or 'aws'
    
    # Upload limits
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB
    ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}
    
    # JWT Auth
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", "72"))
    
    # Observability
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    CLOUDWATCH_ENABLED = os.environ.get("CLOUDWATCH_ENABLED", "false").lower() == "true"
