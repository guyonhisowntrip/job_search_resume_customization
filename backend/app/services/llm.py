import json
import logging
import re
import httpx
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.resume import ResumeData, Personal, Contact, Links


DEFAULT_GEMINI_MODEL = "gemini-1.5-flash"
DEFAULT_GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"
logger = logging.getLogger(__name__)


def _placeholder_resume(text: str) -> ResumeData:
    return ResumeData(
        personal=Personal(name="", title="", summary=text[:200], photo="", primaryPhoto="", secondaryPhoto=""),
        contact=Contact(email="", phone="", location=""),
        links=Links(),
        experience=[],
        projects=[],
        skills=[],
        education=[]
    )


def _build_gemini_url(model: str) -> str:
    if settings.llm_api_url:
        if "{model}" in settings.llm_api_url:
            return settings.llm_api_url.format(model=model)
        if ":generateContent" in settings.llm_api_url:
            return settings.llm_api_url
        if settings.llm_api_url.endswith("/models"):
            return f"{settings.llm_api_url}/{model}:generateContent"
        return f"{settings.llm_api_url.rstrip('/')}/{model}:generateContent"
    return f"{DEFAULT_GEMINI_BASE_URL}/{model}:generateContent"


def _extract_json_payload(text: str) -> dict:
    fenced = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if not fenced:
        fenced = re.search(r"```\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        return json.loads(fenced.group(1))
    loose = re.search(r"(\{.*\})", text, re.DOTALL)
    if loose:
        return json.loads(loose.group(1))
    raise ValueError("No JSON object found in LLM response.")


def extract_resume_json(text: str) -> ResumeData:
    if not settings.llm_api_key:
        raise RuntimeError("LLM_API_KEY (Gemini API key) is not configured.")

    model = settings.llm_model or DEFAULT_GEMINI_MODEL
    url = _build_gemini_url(model)

    schema_hint = (
        "You are a resume parser. Extract ALL relevant details from the resume text. "
        "Return ONLY valid JSON (no markdown, no code fences, no commentary). "
        "Use empty strings or empty arrays when a field is missing. "
        "Keep descriptions concise.\n\n"
        "Schema:\n"
        "{"
        "\"personal\": {\"name\": \"\", \"title\": \"\", \"summary\": \"\", \"photo\": \"\", \"primaryPhoto\": \"\", \"secondaryPhoto\": \"\"},"
        "\"contact\": {\"email\": \"\", \"phone\": \"\", \"location\": \"\"},"
        "\"links\": {\"github\": \"\", \"linkedin\": \"\", \"twitter\": \"\", \"portfolio\": \"\"},"
        "\"experience\": [{\"company\": \"\", \"role\": \"\", \"startDate\": \"\", \"endDate\": \"\", \"description\": \"\"}],"
        "\"projects\": [{\"name\": \"\", \"description\": \"\", \"tech\": [\"\"], \"link\": \"\"}],"
        "\"skills\": [\"\"],"
        "\"education\": [\"\"]"
        "}"
    )

    strict_hint = (
        "IMPORTANT: Output ONLY a JSON object. No prose, no markdown. "
        "Start with '{' and end with '}'."
    )

    def _call_gemini(prompt: str) -> str:
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{prompt}\n\nResume text:\n{text}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 4096,
                "responseMimeType": "application/json",
            },
        }

        response = httpx.post(
            url,
            params={"key": settings.llm_api_key},
            json=payload,
            timeout=30.0,
        )
        response.raise_for_status()
        data = response.json()
        parts = data["candidates"][0]["content"]["parts"]
        return "\n".join(part.get("text", "") for part in parts).strip()

    try:
        llm_text = _call_gemini(schema_hint)
        json_payload = _extract_json_payload(llm_text)
        return ResumeData.model_validate(json_payload)
    except ValueError:
        logger.error("Gemini response did not contain JSON. Raw response:\n%s", llm_text)
        # Retry once with a stricter instruction if the model didn't return JSON.
        try:
            llm_text = _call_gemini(f"{schema_hint}\n\n{strict_hint}")
            logger.error("Gemini strict retry raw response:\n%s", llm_text)
            json_payload = _extract_json_payload(llm_text)
            return ResumeData.model_validate(json_payload)
        except Exception as exc:
            raise RuntimeError(f"Gemini resume parsing failed: {exc}") from exc
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text
        raise RuntimeError(
            f"Gemini resume parsing failed with status {exc.response.status_code}: {detail}"
        ) from exc
    except (httpx.HTTPError, KeyError, IndexError, ValidationError) as exc:
        raise RuntimeError(f"Gemini resume parsing failed: {exc}") from exc
