import json
import os
from datetime import datetime, timezone

import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

from config import MODEL_DIR, TEST_DATA_PATH, TRAIN_DATA_PATH
from src.features import build_tfidf_vectorizer
from src.preprocessor import batch_clean

os.makedirs(MODEL_DIR, exist_ok=True)


def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    required = {"text", "category", "priority"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Dataset missing columns: {missing}")
    df = df.dropna(subset=["text", "category", "priority"])
    df["text"] = df["text"].astype(str).str.strip()
    df = df[df["text"].str.len() > 5]
    print(f"Loaded {len(df)} valid records")
    return df


def preprocess_data(df: pd.DataFrame) -> pd.DataFrame:
    print("Cleaning text...")
    df = df.copy()
    df["clean_text"] = batch_clean(df["text"].tolist())
    df = df[df["clean_text"].str.strip().str.len() > 0]
    print(f"After preprocessing: {len(df)} records")
    return df


def save_processed_splits(df: pd.DataFrame):
    train_df, test_df = train_test_split(
        df,
        test_size=0.2,
        random_state=42,
        stratify=df["category"],
    )
    os.makedirs(os.path.dirname(TRAIN_DATA_PATH), exist_ok=True)
    train_df.to_csv(TRAIN_DATA_PATH, index=False)
    test_df.to_csv(TEST_DATA_PATH, index=False)
    print(f"Saved train split -> {TRAIN_DATA_PATH}")
    print(f"Saved test split -> {TEST_DATA_PATH}")


def train_category_model(df: pd.DataFrame) -> tuple:
    le = LabelEncoder()
    y = le.fit_transform(df["category"])
    x = df["clean_text"]

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    pipeline = Pipeline(
        [
            ("tfidf", build_tfidf_vectorizer()),
            (
                "clf",
                LogisticRegression(
                    C=1.0,
                    max_iter=1000,
                    solver="lbfgs",
                    multi_class="multinomial",
                    class_weight="balanced",
                    random_state=42,
                ),
            ),
        ]
    )

    param_grid = {
        "tfidf__max_features": [5000, 8000],
        "tfidf__ngram_range": [(1, 1), (1, 2)],
        "clf__C": [0.1, 1.0, 10.0],
    }

    print("Running GridSearchCV for category model...")

    grid = GridSearchCV(
        pipeline,
        param_grid,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        scoring="f1_weighted",
        n_jobs=-1,
        verbose=1,
    )
    grid.fit(x_train, y_train)

    best_pipeline = grid.best_estimator_
    print(f"Best params: {grid.best_params_}")

    cv_scores = cross_val_score(
        best_pipeline,
        x,
        y,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        scoring="f1_weighted",
    )
    print(f"CV F1 scores: {cv_scores.round(3)} | Mean: {cv_scores.mean():.3f}")

    y_pred = best_pipeline.predict(x_test)
    report = classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)

    print("\nCategory Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    return best_pipeline, le, report, cv_scores.mean()


def train_priority_model(df: pd.DataFrame) -> tuple:
    le = LabelEncoder()
    y = le.fit_transform(df["priority"])
    x = df["clean_text"]

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    pipeline = Pipeline(
        [
            ("tfidf", build_tfidf_vectorizer(max_features=6000)),
            (
                "clf",
                LogisticRegression(
                    C=5.0,
                    max_iter=1000,
                    solver="lbfgs",
                    multi_class="multinomial",
                    class_weight="balanced",
                    random_state=42,
                ),
            ),
        ]
    )

    param_grid = {
        "tfidf__max_features": [4000, 6000],
        "tfidf__ngram_range": [(1, 1), (1, 2)],
        "clf__C": [1.0, 5.0, 10.0],
    }

    print("\nRunning GridSearchCV for priority model...")

    grid = GridSearchCV(
        pipeline,
        param_grid,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        scoring="f1_weighted",
        n_jobs=-1,
        verbose=1,
    )
    grid.fit(x_train, y_train)

    best_pipeline = grid.best_estimator_
    print(f"Best params: {grid.best_params_}")

    y_pred = best_pipeline.predict(x_test)
    report = classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)

    print("\nPriority Classification Report:")
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    cv_scores = cross_val_score(
        best_pipeline,
        x,
        y,
        cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
        scoring="f1_weighted",
    )

    return best_pipeline, le, report, cv_scores.mean()


def save_models(
    cat_pipeline,
    cat_le,
    pri_pipeline,
    pri_le,
    cat_report,
    pri_report,
    cat_cv,
    pri_cv,
):
    joblib.dump(cat_pipeline, os.path.join(MODEL_DIR, "category_model.pkl"))
    joblib.dump(pri_pipeline, os.path.join(MODEL_DIR, "priority_model.pkl"))
    joblib.dump(cat_le, os.path.join(MODEL_DIR, "label_encoder_cat.pkl"))
    joblib.dump(pri_le, os.path.join(MODEL_DIR, "label_encoder_pri.pkl"))

    metadata = {
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "category_model": {
            "cv_f1_weighted": round(float(cat_cv), 4),
            "test_accuracy": round(float(cat_report["accuracy"]), 4),
            "classes": cat_le.classes_.tolist(),
            "report": cat_report,
        },
        "priority_model": {
            "cv_f1_weighted": round(float(pri_cv), 4),
            "test_accuracy": round(float(pri_report["accuracy"]), 4),
            "classes": pri_le.classes_.tolist(),
            "report": pri_report,
        },
    }

    with open(os.path.join(MODEL_DIR, "model_metadata.json"), "w", encoding="utf-8") as file:
        json.dump(metadata, file, indent=2)

    print(f"\nAll models saved to {MODEL_DIR}")
    print(json.dumps(metadata, indent=2))
