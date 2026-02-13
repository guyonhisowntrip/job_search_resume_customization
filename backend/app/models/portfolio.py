from sqlalchemy import ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class Portfolio(Base):
    __tablename__ = "portfolios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    template: Mapped[str] = mapped_column(String(64))
    resume_json: Mapped[dict] = mapped_column(JSON)
    is_public: Mapped[bool] = mapped_column(default=False)
