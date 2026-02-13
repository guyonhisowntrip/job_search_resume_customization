from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, JSON, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class JobMatch(Base):
    __tablename__ = "job_matches"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    job_description: Mapped[str] = mapped_column(Text)
    original_score: Mapped[float] = mapped_column(Float)
    improved_score: Mapped[float] = mapped_column(Float)
    improved_resume_json: Mapped[dict] = mapped_column(JSON)
    analysis_text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
