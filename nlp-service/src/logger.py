import json
import logging
import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler

from config import LOG_DIR

os.makedirs(LOG_DIR, exist_ok=True)

handler = RotatingFileHandler(
    os.path.join(LOG_DIR, "predictions.log"),
    maxBytes=10 * 1024 * 1024,
    backupCount=5,
)
handler.setFormatter(logging.Formatter("%(message)s"))

pred_logger = logging.getLogger("predictions")
pred_logger.setLevel(logging.INFO)
pred_logger.propagate = False
if not pred_logger.handlers:
    pred_logger.addHandler(handler)

_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="prediction-logger")


def _write_log(entry: dict):
    try:
        pred_logger.info(json.dumps(entry))
    except Exception:
        return


def log_prediction(text: str, result: dict):
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "input": str(text)[:500],
        "result": result,
    }

    try:
        _executor.submit(_write_log, entry)
    except Exception:
        return
