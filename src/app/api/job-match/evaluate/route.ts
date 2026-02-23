import { NextResponse } from "next/server"

import { evaluateJobMatchWithLangChain } from "@/lib/server/job-match"
import { storeJobMatch } from "@/lib/server/store"

export const runtime = "nodejs"

type JobMatchRequestBody = {
  resumeData?: Record<string, unknown>
  jobDescription?: string
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

export async function POST(request: Request) {
  let payload: JobMatchRequestBody

  try {
    payload = (await request.json()) as JobMatchRequestBody
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 })
  }

  const resumeData = asObject(payload.resumeData)
  const jobDescription = typeof payload.jobDescription === "string" ? payload.jobDescription.trim() : ""

  if (!resumeData) {
    return NextResponse.json({ detail: "resumeData is required." }, { status: 400 })
  }

  if (!jobDescription) {
    return NextResponse.json({ detail: "Job description is required." }, { status: 400 })
  }

  let parsed

  try {
    parsed = await evaluateJobMatchWithLangChain(resumeData, jobDescription)
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Job match evaluation failed"
    return NextResponse.json({ detail }, { status: 500 })
  }

  const jobMatch = storeJobMatch(
    jobDescription,
    parsed.originalScore,
    parsed.improvedScore,
    parsed.improvedResume,
    parsed.analysis
  )

  return NextResponse.json({
    jobMatchId: jobMatch.id,
    originalScore: parsed.originalScore,
    improvedScore: parsed.improvedScore,
    improvedResume: parsed.improvedResume,
    analysis: parsed.analysis,
    createdAt: jobMatch.created_at,
  })
}
