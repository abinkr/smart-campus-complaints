import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score

from src.preprocessor import batch_clean
from src.predictor import predictor


def evaluate_on_csv(csv_path: str) -> dict:
    if not predictor._loaded:
        predictor.load()

    df = pd.read_csv(csv_path)
    df["clean_text"] = batch_clean(df["text"].tolist())

    results = predictor.predict_batch(df["text"].tolist())

    cat_pred = [result["category"] for result in results]
    pri_pred = [result["priority"] for result in results]

    cat_true = df["category"].tolist()
    pri_true = df["priority"].tolist()

    cat_report = classification_report(cat_true, cat_pred, output_dict=True)
    pri_report = classification_report(pri_true, pri_pred, output_dict=True)

    print("=== CATEGORY MODEL ===")
    print(classification_report(cat_true, cat_pred))
    print("Confusion Matrix:")
    print(confusion_matrix(cat_true, cat_pred))

    print("\n=== PRIORITY MODEL ===")
    print(classification_report(pri_true, pri_pred))
    print("Confusion Matrix:")
    print(confusion_matrix(pri_true, pri_pred))

    return {
        "category": {
            "accuracy": round(accuracy_score(cat_true, cat_pred), 4),
            "f1_weighted": round(f1_score(cat_true, cat_pred, average="weighted"), 4),
            "report": cat_report,
        },
        "priority": {
            "accuracy": round(accuracy_score(pri_true, pri_pred), 4),
            "f1_weighted": round(f1_score(pri_true, pri_pred, average="weighted"), 4),
            "report": pri_report,
        },
    }
