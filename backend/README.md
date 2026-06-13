# Relog Backend

## Run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The default database is SQLite. Set `DATABASE_URL` to a PostgreSQL URL for production.

## Test

```bash
pytest
```

