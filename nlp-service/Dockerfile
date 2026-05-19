FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "import nltk; \
    nltk.download('stopwords', quiet=True); \
    nltk.download('wordnet',   quiet=True); \
    nltk.download('punkt',     quiet=True); \
    nltk.download('punkt_tab', quiet=True)"

COPY . .

RUN python -c "from pathlib import Path; required = ['models/category_model.pkl', 'models/priority_model.pkl', 'models/label_encoder_cat.pkl', 'models/label_encoder_pri.pkl', 'models/model_metadata.json']; missing = [p for p in required if not Path(p).exists()]; assert not missing, f'Missing model files: {missing}'"

RUN mkdir -p /app/logs && useradd --create-home --shell /usr/sbin/nologin appuser && chown -R appuser:appuser /app

EXPOSE 5001

USER appuser

CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5001} --workers 2 --timeout 120 app:app"]
