import { ResumeData } from "@/lib/resume-schema"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

type ApiErrorPayload = {
  detail?: string
}

async function parseApiError(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorPayload
    if (payload?.detail) {
      return payload.detail
    }
  } catch {
    // noop
  }

  const text = await response.text()
  return text || `Request failed: ${response.status}`
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  return (await response.json()) as T
}

export type UploadResponse = {
  uploadId: string
}

export type ParseResponse = {
  resumeData: ResumeData
}

export type DeployResponse = {
  url: string
}

export type JobMatchEvaluateResponse = {
  jobMatchId: number
  originalScore: number
  improvedScore: number
  improvedResume: Record<string, unknown>
  analysis: string
  createdAt: string
}

export async function uploadResume(file: File): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  return (await response.json()) as UploadResponse
}

export async function parseUploadedResume(uploadId: string): Promise<ParseResponse> {
  return apiFetch<ParseResponse>("/api/resume/parse", {
    method: "POST",
    body: JSON.stringify({ uploadId })
  })
}

export async function deployPortfolio(payload: {
  username: string
  template: string
  resumeData: ResumeData
}): Promise<DeployResponse> {
  return apiFetch<DeployResponse>("/api/portfolio/deploy", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export async function evaluateJobMatch(payload: {
  resumeData: ResumeData
  jobDescription: string
}): Promise<JobMatchEvaluateResponse> {
  return apiFetch<JobMatchEvaluateResponse>("/api/job-match/evaluate", {
    method: "POST",
    body: JSON.stringify(payload)
  })
}

export async function getPublicPortfolio(username: string, init?: RequestInit): Promise<{ resumeData: ResumeData }> {
  const response = await fetch(`${API_BASE_URL}/api/portfolio/${username}`, {
    ...init
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  return (await response.json()) as { resumeData: ResumeData }
}
