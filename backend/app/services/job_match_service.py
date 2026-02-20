from datetime import datetime, timezone
from threading import Lock

_job_match_lock = Lock()
_job_match_sequence = 1


def store_job_match(
    job_description: str,
    original_score: float,
    improved_score: float,
    improved_resume_json: dict,
    analysis_text: str,
) -> dict:
    global _job_match_sequence

    with _job_match_lock:
        job_match_id = _job_match_sequence
        _job_match_sequence += 1

    return {
        "id": job_match_id,
        "job_description": job_description,
        "original_score": original_score,
        "improved_score": improved_score,
        "improved_resume_json": improved_resume_json,
        "analysis_text": analysis_text,
        "created_at": datetime.now(timezone.utc),
    }
