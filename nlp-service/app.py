import hmac

from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel, field_validator, ValidationError

from config import BATCH_LIMIT, CLIENT_URLS, MAX_TEXT_LENGTH, NLP_REQUIRE_SECRET, RELOAD_SECRET
from src.logger import log_prediction
from src.predictor import predictor

app = Flask(__name__)
CORS(app, origins=CLIENT_URLS)


PUBLIC_PATHS = {"/health"}


def validation_errors(error: ValidationError) -> list[dict]:
    return error.errors(include_context=False)


class ClassifyRequest(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("text must not be empty")
        if len(value) > MAX_TEXT_LENGTH:
            raise ValueError(f"text must be under {MAX_TEXT_LENGTH} characters")
        return value.strip()


@app.before_request
def load_models_once():
    if request.method != "OPTIONS" and request.path not in PUBLIC_PATHS and NLP_REQUIRE_SECRET:
        provided_secret = request.headers.get("X-NLP-Secret") or request.headers.get("X-Reload-Secret")

        if not provided_secret or not hmac.compare_digest(provided_secret, RELOAD_SECRET):
            return jsonify({"error": "Unauthorized"}), 401

    if not predictor._loaded:
        predictor.load()


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "models": predictor._loaded,
            "metadata": predictor.metadata,
        }
    )


@app.route("/classify", methods=["POST"])
def classify():
    try:
        body = ClassifyRequest(**request.get_json(force=True))
    except ValidationError as error:
        return jsonify({"error": validation_errors(error)}), 422
    except Exception:
        return jsonify({"error": "Invalid JSON body"}), 400

    try:
        result = predictor.predict(body.text)
        log_prediction(body.text, result)
        return jsonify(result), 200
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503


@app.route("/classify/batch", methods=["POST"])
def classify_batch():
    try:
        data = request.get_json(force=True)
        texts = data.get("texts", [])

        if not isinstance(texts, list) or len(texts) == 0:
            return jsonify({"error": "texts must be a non-empty array"}), 422

        if len(texts) > BATCH_LIMIT:
            return jsonify({"error": f"batch limit is {BATCH_LIMIT} texts per request"}), 422

        for text in texts:
            ClassifyRequest(text=text)

        results = predictor.predict_batch(texts)
        for text, result in zip(texts, results):
            log_prediction(text, result)

        return jsonify({"results": results}), 200
    except ValidationError as error:
        return jsonify({"error": validation_errors(error)}), 422
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/explain", methods=["POST"])
def explain():
    try:
        body = ClassifyRequest(**request.get_json(force=True))
        result = predictor.get_top_features(body.text)
        return jsonify(result), 200
    except ValidationError as error:
        return jsonify({"error": validation_errors(error)}), 422
    except RuntimeError as error:
        return jsonify({"error": str(error)}), 503


@app.route("/reload", methods=["POST"])
def reload_models():
    secret = request.headers.get("X-Reload-Secret")

    if secret != RELOAD_SECRET:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        predictor.reload()
        return jsonify({"status": "models reloaded", "metadata": predictor.metadata}), 200
    except Exception as error:
        return jsonify({"error": str(error)}), 500


@app.route("/metadata", methods=["GET"])
def metadata():
    return jsonify(predictor.metadata or {}), 200


try:
    predictor.load()
except Exception as error:
    app.logger.warning("Model preload deferred: %s", error)


if __name__ == "__main__":
    if not predictor._loaded:
        predictor.load()
    app.run(host="0.0.0.0", port=5001, debug=False)
