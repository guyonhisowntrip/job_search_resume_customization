from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import ValidationError
from uuid import uuid4
import os
import logging
import re

from app.schemas.portfolio import (
    UploadResponse,
    ParseRequest,
    ParseResponse,
    DeployRequest,
    DeployResponse,
    PortfolioResponse,
)
from app.schemas.job_match import JobMatchEvaluateRequest, JobMatchEvaluateResponse, N8NJobMatchResponse
from app.services.parser import extract_text_from_pdf
from app.services.llm import extract_resume_json
from app.services.portfolio_service import deploy_portfolio, get_portfolio
from app.services.job_match_service import store_job_match
from app.services.n8n_client import request_job_match, N8NServiceError
from app.core.config import settings

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)
USERNAME_PATTERN = r"^[a-z0-9-]{3,30}$"
RESERVED_OR_ASSET_PATHS = {"favicon.ico", "robots.txt", "sitemap.xml"}

UPLOAD_DIR = "/tmp/resume_uploads"


@router.post("/resume/upload", response_model=UploadResponse)
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    upload_id = str(uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{upload_id}.pdf")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    return UploadResponse(uploadId=upload_id)


@router.post("/resume/parse", response_model=ParseResponse)
def parse_resume(payload: ParseRequest):
    file_path = os.path.join(UPLOAD_DIR, f"{payload.uploadId}.pdf")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Upload not found.")

    text = extract_text_from_pdf(file_path)
    try:
        resume_data = extract_resume_json(text)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ParseResponse(resumeData=resume_data)


@router.post("/portfolio/deploy", response_model=DeployResponse)
def deploy(payload: DeployRequest):
    deploy_portfolio(payload.username, payload.template, payload.resumeData.model_dump())
    url = f"{settings.public_base_url}/{payload.username.lower()}"
    return DeployResponse(url=url)


@router.get("/portfolio/{username}", response_model=PortfolioResponse)
def get_public_portfolio(username: str):
    normalized = username.lower()
    if normalized in RESERVED_OR_ASSET_PATHS or "." in username:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    if not re.match(USERNAME_PATTERN, normalized):
        raise HTTPException(status_code=404, detail="Portfolio not found")

    portfolio = get_portfolio(normalized)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return PortfolioResponse(resumeData=portfolio["resume_json"])


@router.post("/job-match/evaluate", response_model=JobMatchEvaluateResponse)
async def evaluate_job_match(payload: JobMatchEvaluateRequest):
    job_description = payload.jobDescription.strip()
    if not job_description:
        raise HTTPException(status_code=400, detail="Job description is required.")

    try:
        n8n_raw = await request_job_match(payload.resumeData.model_dump(), job_description)
        n8n_response = N8NJobMatchResponse.model_validate(n8n_raw)
    except N8NServiceError as exc:
        logger.exception("n8n workflow error")
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except ValidationError as exc:
        logger.exception("Unexpected response from n8n")
        raise HTTPException(status_code=502, detail="Invalid response from n8n workflow") from exc

    job_match = store_job_match(
        job_description=job_description,
        original_score=n8n_response.originalScore,
        improved_score=n8n_response.improvedScore,
        improved_resume_json=n8n_response.improvedResume,
        analysis_text=n8n_response.analysis,
    )

    return JobMatchEvaluateResponse(
        jobMatchId=job_match["id"],
        originalScore=n8n_response.originalScore,
        improvedScore=n8n_response.improvedScore,
        improvedResume=n8n_response.improvedResume,
        analysis=n8n_response.analysis,
        createdAt=job_match["created_at"],
    )
