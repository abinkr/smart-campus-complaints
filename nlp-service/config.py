import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:3000")
CLIENT_URLS = [origin.strip() for origin in CLIENT_URL.split(",") if origin.strip()]
RELOAD_SECRET = os.getenv("RELOAD_SECRET", "internal-secret")
NLP_REQUIRE_SECRET = os.getenv("NLP_REQUIRE_SECRET", "true").lower() not in {"0", "false", "no"}
ENVIRONMENT = os.getenv("ENVIRONMENT", os.getenv("FLASK_ENV", "development")).lower()
MODEL_DIR = os.getenv("MODEL_DIR", str(BASE_DIR / "models"))
DATA_PATH = os.getenv("DATA_PATH", str(BASE_DIR / "data" / "raw" / "complaints.csv"))
TRAIN_DATA_PATH = os.getenv("TRAIN_DATA_PATH", str(BASE_DIR / "data" / "processed" / "train.csv"))
TEST_DATA_PATH = os.getenv("TEST_DATA_PATH", str(BASE_DIR / "data" / "processed" / "test.csv"))
LOG_DIR = os.getenv("LOG_DIR", str(BASE_DIR / "logs"))
MAX_TEXT_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "5000"))
BATCH_LIMIT = int(os.getenv("BATCH_LIMIT", "100"))

if ENVIRONMENT == "production" and (RELOAD_SECRET == "internal-secret" or len(RELOAD_SECRET) < 32):
    raise RuntimeError("RELOAD_SECRET must be a real secret of at least 32 characters in production")
