from sqlalchemy import ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    raw_text: Mapped[str | None] = mapped_column(nullable=True)
    parsed_json: Mapped[dict] = mapped_column(JSON)
