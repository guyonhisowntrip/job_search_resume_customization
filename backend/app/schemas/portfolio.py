from pydantic import BaseModel
from app.schemas.resume import ResumeData


class UploadResponse(BaseModel):
    uploadId: str


class ParseRequest(BaseModel):
    uploadId: str


class ParseResponse(BaseModel):
    resumeData: ResumeData


class DeployRequest(BaseModel):
    username: str
    template: str
    resumeData: ResumeData


class DeployResponse(BaseModel):
    url: str


class PortfolioResponse(BaseModel):
    resumeData: ResumeData
