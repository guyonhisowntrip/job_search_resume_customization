import { NextResponse } from "next/server"

import { resolvePublicBaseUrl } from "@/lib/server/config"
import { deployPortfolio } from "@/lib/server/store"

export const runtime = "nodejs"

type DeployRequestBody = {
  username?: string
  template?: string
  resumeData?: Record<string, unknown>
}

export async function POST(request: Request) {
  let payload: DeployRequestBody

  try {
    payload = (await request.json()) as DeployRequestBody
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body." }, { status: 400 })
  }

  const username = typeof payload.username === "string" ? payload.username.trim() : ""
  const template = typeof payload.template === "string" ? payload.template.trim() : ""
  const resumeData = payload.resumeData

  if (!username || !template || !resumeData || typeof resumeData !== "object" || Array.isArray(resumeData)) {
    return NextResponse.json(
      { detail: "username, template, and resumeData are required." },
      { status: 400 }
    )
  }

  deployPortfolio(username, template, resumeData)

  const baseUrl = resolvePublicBaseUrl(request.url)
  return NextResponse.json({ url: `${baseUrl}/${username.toLowerCase()}` })
}
