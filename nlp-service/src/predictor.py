import json
import os

import joblib
import numpy as np

from config import MODEL_DIR
from src.preprocessor import clean_text

HIGH_KEYWORDS = {
    "fire",
    "flood",
    "short circuit",
    "electrocution",
    "shock",
    "collapse",
    "emergency",
    "urgent",
    "danger",
    "hazard",
    "injury",
    "injured",
    "burning",
    "burst",
    "overflow",
    "accident",
}

LOW_KEYWORDS = {
    "suggestion",
    "suggest",
    "request",
    "recommend",
    "improvement",
    "minor",
    "small",
    "convenience",
    "would be nice",
    "if possible",
}


class Predictor:
    def __init__(self):
        self.cat_pipeline = None
        self.pri_pipeline = None
        self.cat_encoder = None
        self.pri_encoder = None
        self.metadata = None
        self._loaded = False

    def load(self):
        self.cat_pipeline = joblib.load(os.path.join(MODEL_DIR, "category_model.pkl"))
        self.pri_pipeline = joblib.load(os.path.join(MODEL_DIR, "priority_model.pkl"))
        self.cat_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder_cat.pkl"))
        self.pri_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder_pri.pkl"))

        meta_path = os.path.join(MODEL_DIR, "model_metadata.json")
        self.metadata = None

        if os.path.exists(meta_path):
            with open(meta_path, encoding="utf-8") as file:
                self.metadata = json.load(file)

        self._loaded = True
        print("Models loaded successfully")

    def reload(self):
        self._loaded = False
        self.load()
        print("Models reloaded")

    def predict(self, text: str) -> dict:
        if not self._loaded:
            raise RuntimeError("Models not loaded. Call predictor.load() first.")

        if not text or not text.strip():
            return {
                "category": "Other",
                "priority": "MEDIUM",
                "category_confidence": 0.0,
                "priority_confidence": 0.0,
                "override_applied": False,
            }

        clean = clean_text(text)
        text_lower = text.lower()

        cat_proba = self.cat_pipeline.predict_proba([clean])[0]
        cat_idx = int(np.argmax(cat_proba))
        cat_conf = float(cat_proba[cat_idx])
        category = self.cat_encoder.inverse_transform([cat_idx])[0]

        pri_proba = self.pri_pipeline.predict_proba([clean])[0]
        pri_idx = int(np.argmax(pri_proba))
        pri_conf = float(pri_proba[pri_idx])
        priority = self.pri_encoder.inverse_transform([pri_idx])[0]

        override_applied = False

        if any(keyword in text_lower for keyword in HIGH_KEYWORDS):
            priority = "HIGH"
            pri_conf = 1.0
            override_applied = True
        elif any(keyword in text_lower for keyword in LOW_KEYWORDS) and priority != "HIGH":
            priority = "LOW"
            pri_conf = 0.9
            override_applied = True

        if pri_conf < 0.45 and not override_applied:
            priority = "MEDIUM"
            override_applied = True

        return {
            "category": category,
            "priority": priority,
            "category_confidence": round(cat_conf, 4),
            "priority_confidence": round(pri_conf, 4),
            "override_applied": override_applied,
        }

    def predict_batch(self, texts: list[str]) -> list[dict]:
        return [self.predict(text) for text in texts]

    def get_top_features(self, text: str, n: int = 10) -> dict:
        if not self._loaded:
            raise RuntimeError("Models not loaded. Call predictor.load() first.")

        clean = clean_text(text)

        vectorizer = self.cat_pipeline.named_steps["tfidf"]
        clf = self.cat_pipeline.named_steps["clf"]

        tfidf_vector = vectorizer.transform([clean])
        feature_names = vectorizer.get_feature_names_out()
        coef = clf.coef_

        cat_proba = self.cat_pipeline.predict_proba([clean])[0]
        cat_idx = int(np.argmax(cat_proba))
        category = self.cat_encoder.inverse_transform([cat_idx])[0]

        try:
            import eli5

            explanation = eli5.explain_prediction(clf, clean, vec=vectorizer, top=n, target=cat_idx)
            target = explanation.targets[0]
            top_features = [
                {
                    "feature": weight.feature,
                    "score": round(float(weight.weight), 4),
                }
                for weight in target.feature_weights.pos[:n]
                if weight.weight > 0
            ]

            if top_features:
                return {
                    "predicted_category": category,
                    "top_features": top_features,
                }
        except Exception:
            pass

        scores = tfidf_vector.toarray()[0] * coef[cat_idx]
        top_indices = np.argsort(scores)[::-1][:n]

        return {
            "predicted_category": category,
            "top_features": [
                {
                    "feature": feature_names[index],
                    "score": round(float(scores[index]), 4),
                }
                for index in top_indices
                if scores[index] > 0
            ],
        }


predictor = Predictor()
