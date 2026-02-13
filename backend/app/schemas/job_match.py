from datetime import datetime

from pydantic import BaseModel, Field, AliasChoices, ConfigDict


class JobMatchEvaluateRequest(BaseModel):
    username: str
    jobDescription: str


class N8NJobMatchResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    originalScore: float = Field(validation_alias=AliasChoices("originalScore", "original_score"))
    improvedScore: float = Field(validation_alias=AliasChoices("improvedScore", "improved_score"))
    improvedResume: dict = Field(
        validation_alias=AliasChoices(
            "improvedResume",
            "improvedResumeJson",
            "improved_resume",
            "improved_resume_json",
        )
    )
    analysis: str = Field(validation_alias=AliasChoices("analysis", "analysisText", "analysis_text"))


class JobMatchEvaluateResponse(BaseModel):
    jobMatchId: int
    originalScore: float
    improvedScore: float
    improvedResume: dict
    analysis: str
    createdAt: datetime
