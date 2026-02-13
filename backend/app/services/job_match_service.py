from sqlalchemy.orm import Session

from app.models.job_match import JobMatch
from app.models.resume import Resume
from app.models.user import User


def get_user_resume_json(db: Session, username: str) -> tuple[User, dict] | None:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None

    resume = db.query(Resume).filter(Resume.user_id == user.id).first()
    if not resume:
        return None

    return user, resume.parsed_json


def store_job_match(
    db: Session,
    user_id: int,
    job_description: str,
    original_score: float,
    improved_score: float,
    improved_resume_json: dict,
    analysis_text: str,
) -> JobMatch:
    job_match = JobMatch(
        user_id=user_id,
        job_description=job_description,
        original_score=original_score,
        improved_score=improved_score,
        improved_resume_json=improved_resume_json,
        analysis_text=analysis_text,
    )
    db.add(job_match)
    db.commit()
    db.refresh(job_match)
    return job_match
