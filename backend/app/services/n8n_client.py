from typing import Any

import httpx

from app.core.config import settings


class N8NServiceError(RuntimeError):
    pass


async def request_job_match(resume_json: dict, job_description: str) -> dict[str, Any]:
    if not settings.n8n_webhook_url:
        raise N8NServiceError("N8N_WEBHOOK_URL is not configured")

    payload = {"resume": resume_json, "jobDescription": job_description}

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(settings.n8n_webhook_url, json=payload)
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise N8NServiceError("Failed to reach n8n workflow") from exc

    try:
        return response.json()
    except ValueError as exc:
        raise N8NServiceError("Invalid JSON returned by n8n workflow") from exc
