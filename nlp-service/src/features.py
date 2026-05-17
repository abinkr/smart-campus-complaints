import os

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder

from config import MODEL_DIR


def build_tfidf_vectorizer(
    ngram_range: tuple = (1, 2),
    max_features: int = 8000,
    sublinear_tf: bool = True,
    min_df: int = 2,
    max_df: float = 0.95,
) -> TfidfVectorizer:
    return TfidfVectorizer(
        ngram_range=ngram_range,
        max_features=max_features,
        sublinear_tf=sublinear_tf,
        min_df=min_df,
        max_df=max_df,
        analyzer="word",
        strip_accents="unicode",
        token_pattern=r"\b[a-zA-Z][a-zA-Z\-]+\b",
    )


def save_encoder(encoder: LabelEncoder, name: str):
    os.makedirs(MODEL_DIR, exist_ok=True)
    path = os.path.join(MODEL_DIR, f"{name}.pkl")
    joblib.dump(encoder, path)
    print(f"Saved encoder -> {path}")


def load_encoder(name: str) -> LabelEncoder:
    path = os.path.join(MODEL_DIR, f"{name}.pkl")
    return joblib.load(path)
