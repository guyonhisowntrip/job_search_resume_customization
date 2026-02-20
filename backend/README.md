# Backend (FastAPI)

Resume Portfolio API service.

## Requirements
- Python 3.10+ (recommended)

## Setup
1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Configure environment variables (create `.env` in `backend/`):

```env
APP_NAME=resume-portfolio-backend
LLM_API_KEY=
LLM_API_URL=https://generativelanguage.googleapis.com/v1beta/models
LLM_MODEL=gemini-1.5-flash
N8N_WEBHOOK_URL=
PUBLIC_BASE_URL=http://localhost:3000
```

## Run
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API
- Base path: `/api`
- Health/docs: `/docs` and `/redoc`

## Runtime Storage Notes
- This backend does not use a database.
- Deployed portfolios are stored in memory only while the backend process is running.
- Job match result metadata (`jobMatchId`, `createdAt`) is generated in memory per process.

## Notes
- The default CORS policy allows all origins. Lock this down in production.
