import { Metadata } from "next"
import { notFound } from "next/navigation"

import PortfolioRenderer from "@/components/portfolio/portfolio-renderer"
import { API_BASE_URL } from "@/lib/api"
import { ResumeData } from "@/lib/resume-schema"

type PublicPortfolioResponse = {
  resumeData: ResumeData
}

const RESERVED_OR_ASSET_PATHS = new Set(["favicon.ico", "robots.txt", "sitemap.xml"])

function isValidPublicUsername(username: string) {
  if (RESERVED_OR_ASSET_PATHS.has(username.toLowerCase())) {
    return false
  }

  // Keep this aligned with deploy username constraints.
  if (!/^[a-z0-9-]{3,30}$/.test(username)) {
    return false
  }

  // Avoid treating asset-like requests as usernames.
  if (username.includes(".")) {
    return false
  }

  return true
}

async function fetchPublicPortfolio(username: string): Promise<PublicPortfolioResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/${username}`, {
      next: { revalidate: 120 }
    })

    if (!response.ok) {
      return null
    }

    return (await response.json()) as PublicPortfolioResponse
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params

  if (!isValidPublicUsername(username)) {
    return {
      title: "Portfolio Not Found"
    }
  }

  const data = await fetchPublicPortfolio(username)

  if (!data) {
    return {
      title: "Portfolio Not Found"
    }
  }

  const name = data.resumeData.personal.name || username
  const title = data.resumeData.personal.title || "Portfolio"
  const summary = data.resumeData.personal.summary || `${name}'s professional portfolio`

  return {
    title: `${name} | Portfolio`,
    description: summary,
    openGraph: {
      title: `${name} | ${title}`,
      description: summary,
      type: "website"
    }
  }
}

export default async function PublicPortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  if (!isValidPublicUsername(username)) {
    notFound()
  }

  const data = await fetchPublicPortfolio(username)

  if (!data) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <PortfolioRenderer templateId="portfolio-v1" resumeData={data.resumeData} />
    </main>
  )
}
