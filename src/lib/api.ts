import { ResumeData } from "@/lib/resume-schema"

const CLIENT_API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "")
const SERVER_API_BASE_URL = (
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
).replace(/\/$/, "")

export const API_BASE_URL = typeof window === "undefined" ? SERVER_API_BASE_URL : CLIENT_API_BASE_URL

type ApiErrorPayload = {
  detail?: string
}

function toApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  if (!API_BASE_URL) {
    return normalizedPath
  }

  return `${API_BASE_URL}${normalizedPath}`
}

async function parseApiError(response: Response) {
  const text = await response.text()

  if (!text) {
    return `Request failed: ${response.status}`
  }

  try {
    const payload = JSON.parse(text) as ApiErrorPayload
    if (payload?.detail) {
      return payload.detail
    }
  } catch {
    return text
  }

  return text
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(toApiUrl(path), {
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

  const response = await fetch(toApiUrl("/api/resume/upload"), {
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
  const response = await fetch(toApiUrl(`/api/portfolio/${username}`), {
    ...init
  })

  if (!response.ok) {
    throw new Error(await parseApiError(response))
  }

  return (await response.json()) as { resumeData: ResumeData }
}
