from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "resume-portfolio-backend"
    database_url: str = "mysql+mysqlconnector://user:password@localhost:3306/resume_portfolio"
    llm_api_key: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"),
    )
    llm_api_url: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_API_URL", "GEMINI_API_URL"),
    )
    llm_model: str | None = Field(
        default=None,
        validation_alias=AliasChoices("LLM_MODEL", "GEMINI_MODEL"),
    )
    n8n_webhook_url: str | None = Field(
        default=None,
        validation_alias=AliasChoices("N8N_WEBHOOK_URL"),
    )
    public_base_url: str = "https://myplatform.com"

    class Config:
        env_file = ".env"


settings = Settings()
