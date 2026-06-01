import json
import os
import re

import joblib
import numpy as np

from config import MODEL_DIR
from src.preprocessor import clean_text

MODEL_CATEGORY_MAP = {
    "Electricity": "Electrical",
    "Water": "Plumbing",
    "Network": "IT",
    "Sanitation": "Cleaning",
    "Furniture": "Maintenance",
}

CATEGORY_KEYWORDS = [
    (
        "Electrical",
        {
            "fire",
            "smoke",
            "burning",
            "electricity",
            "electrical",
            "power",
            "power cut",
            "power outage",
            "no electricity",
            "short circuit",
            "spark",
            "sparking",
            "shock",
            "electric shock",
            "electrocution",
            "exposed wire",
            "wire",
            "wiring",
            "switch",
            "socket",
            "outlet",
            "breaker",
            "voltage",
            "light",
            "fan",
            "ac",
        },
    ),
    (
        "Plumbing",
        {
            "water",
            "no water",
            "water not coming",
            "drinking water",
            "water cooler",
            "tap",
            "pipe",
            "leak",
            "leaking",
            "burst pipe",
            "flood",
            "flooding",
            "overflow",
            "drain",
            "toilet",
            "bathroom",
            "washroom",
            "flush",
            "sink",
            "sewer",
            "sewage",
        },
    ),
    (
        "IT",
        {
            "wifi",
            "wi-fi",
            "internet",
            "network",
            "server",
            "login",
            "portal",
            "website",
            "app",
            "software",
            "computer",
            "pc",
            "lab pc",
            "printer",
            "projector",
            "rfid",
            "system error",
            "password",
        },
    ),
    (
        "Cleaning",
        {
            "cleaning",
            "dirty",
            "garbage",
            "trash",
            "waste",
            "dustbin",
            "smell",
            "odor",
            "odour",
            "hygiene",
            "sanitation",
            "mosquito",
            "pest",
            "graffiti",
        },
    ),
    (
        "Maintenance",
        {
            "broken",
            "repair",
            "damaged",
            "furniture",
            "chair",
            "bench",
            "desk",
            "table",
            "door",
            "window",
            "lock",
            "ceiling",
            "roof",
            "wall",
            "floor",
            "lift",
            "elevator",
            "classroom",
            "infrastructure",
        },
    ),
    (
        "Administration",
        {
            "fee",
            "fees",
            "scholarship",
            "certificate",
            "exam",
            "timetable",
            "attendance",
            "id card",
            "canteen",
            "cafeteria",
            "food",
            "office",
            "document",
            "admission",
            "library",
        },
    ),
]

HIGH_KEYWORDS = {
    "fire",
    "smoke",
    "flood",
    "flooding",
    "short circuit",
    "electric shock",
    "electrocution",
    "shock",
    "collapse",
    "collapsed",
    "emergency",
    "urgent",
    "danger",
    "dangerous",
    "hazard",
    "hazardous",
    "injury",
    "injured",
    "burning",
    "burst",
    "burst pipe",
    "overflow",
    "sewage leak",
    "gas leak",
    "exposed wire",
    "contaminated",
    "food poisoning",
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

HIGH_CONTEXT_PATTERNS = (
    re.compile(
        r"\b(no water|water not coming|no electricity|power outage|internet down|network down)\b"
        r".*\b(entire|whole|all|hostel|building|block|campus|exam|lab|server|urgent|emergency)\b"
    ),
    re.compile(
        r"\b(entire|whole|all|hostel|building|block|campus|exam|lab|server|urgent|emergency)\b"
        r".*\b(no water|water not coming|no electricity|power outage|internet down|network down)\b"
    ),
)


def _contains_keyword(text_lower: str, keyword: str) -> bool:
    pattern = re.escape(keyword).replace(r"\ ", r"\s+")
    return re.search(rf"(?<![a-z0-9]){pattern}(?![a-z0-9])", text_lower) is not None


def _matches_any(text_lower: str, keywords: set[str]) -> bool:
    return any(_contains_keyword(text_lower, keyword) for keyword in keywords)


def _keyword_category(text_lower: str) -> str | None:
    for category, keywords in CATEGORY_KEYWORDS:
        if _matches_any(text_lower, keywords):
            return category
    return None


def _canonical_category(category: str) -> str:
    return MODEL_CATEGORY_MAP.get(category, category)


def _keyword_priority(text_lower: str) -> str | None:
    if _matches_any(text_lower, HIGH_KEYWORDS) or any(
        pattern.search(text_lower) for pattern in HIGH_CONTEXT_PATTERNS
    ):
        return "HIGH"

    if _matches_any(text_lower, LOW_KEYWORDS):
        return "LOW"

    return None


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
        category = _canonical_category(self.cat_encoder.inverse_transform([cat_idx])[0])

        pri_proba = self.pri_pipeline.predict_proba([clean])[0]
        pri_idx = int(np.argmax(pri_proba))
        pri_conf = float(pri_proba[pri_idx])
        priority = self.pri_encoder.inverse_transform([pri_idx])[0]

        override_applied = False
        keyword_category = _keyword_category(text_lower)

        if keyword_category and keyword_category != category:
            category = keyword_category
            cat_conf = 0.95
            override_applied = True

        keyword_priority = _keyword_priority(text_lower)

        if keyword_priority == "HIGH":
            priority = "HIGH"
            pri_conf = 1.0
            override_applied = True
        elif keyword_priority == "LOW" and priority != "HIGH":
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
        category = _canonical_category(self.cat_encoder.inverse_transform([cat_idx])[0])

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
