import { NextResponse } from "next/server"

import { extractResumeJson } from "@/lib/server/llm"
import { readUploadId } from "@/lib/server/upload-token"

export const runtime = "nodejs"

type ParseRequestBody = {
  uploadId?: string
}

export async function POST(request: Request) {
  let payload: ParseRequestBody

  try {
    payload = (await request.json()) as ParseRequestBody
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 })
  }

  const uploadId = typeof payload.uploadId === "string" ? payload.uploadId : ""
  if (!uploadId) {
    return NextResponse.json({ detail: "uploadId is required." }, { status: 400 })
  }

  let resumeText = ""

  try {
    resumeText = readUploadId(uploadId)
  } catch {
    return NextResponse.json({ detail: "Upload not found." }, { status: 404 })
  }

  try {
    const resumeData = await extractResumeJson(resumeText)
    return NextResponse.json({ resumeData })
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Resume parsing failed."
    return NextResponse.json({ detail }, { status: 500 })
  }
}
