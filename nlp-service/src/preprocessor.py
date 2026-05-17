import re

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

nltk.download("stopwords", quiet=True)
nltk.download("wordnet", quiet=True)
nltk.download("punkt", quiet=True)

STOP_WORDS = set(stopwords.words("english"))

DOMAIN_PRESERVE = {
    "not",
    "no",
    "nor",
    "never",
    "out",
    "off",
    "down",
    "up",
    "slow",
    "low",
    "high",
    "very",
    "too",
    "urgent",
}

STOP_WORDS = STOP_WORDS - DOMAIN_PRESERVE
lemmatizer = WordNetLemmatizer()


def _tokenize(text: str) -> list[str]:
    try:
        return word_tokenize(text)
    except LookupError:
        nltk.download("punkt", quiet=True)
        try:
            return word_tokenize(text)
        except LookupError:
            return re.findall(r"\b[a-zA-Z][a-zA-Z\-]+\b", text)


def clean_text(text: str) -> str:
    if not isinstance(text, str) or not text.strip():
        return ""

    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"\S+@\S+", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"\b\d+\b", "", text)
    text = re.sub(r"[^\w\s\-]", " ", text)
    text = re.sub(r"\s*-\s*", "-", text)

    tokens = _tokenize(text)

    tokens = [
        lemmatizer.lemmatize(token)
        for token in tokens
        if token not in STOP_WORDS and len(token) > 1
    ]

    return " ".join(tokens)


def batch_clean(texts: list[str]) -> list[str]:
    return [clean_text(text) for text in texts]
