import { NextResponse } from "next/server"

import { getPortfolio } from "@/lib/server/store"

export const runtime = "nodejs"

const USERNAME_PATTERN = /^[a-z0-9-]{3,30}$/
const RESERVED_OR_ASSET_PATHS = new Set(["favicon.ico", "robots.txt", "sitemap.xml"])

function notFoundResponse() {
  return NextResponse.json({ detail: "Portfolio not found" }, { status: 404 })
}

export async function GET(_request: Request, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params
  const normalized = username.toLowerCase()

  if (RESERVED_OR_ASSET_PATHS.has(normalized) || username.includes(".")) {
    return notFoundResponse()
  }

  if (!USERNAME_PATTERN.test(normalized)) {
    return notFoundResponse()
  }

  const portfolio = getPortfolio(normalized)
  if (!portfolio) {
    return notFoundResponse()
  }

  return NextResponse.json({ resumeData: portfolio.resume_json })
}
