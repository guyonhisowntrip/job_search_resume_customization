import fs from "fs"
import os from "os"
import path from "path"

type PortfolioRecord = {
  username: string
  template: string
  resume_json: Record<string, unknown>
  is_public: boolean
}

const PORTFOLIO_STORE_FILE = path.join(os.tmpdir(), "onetapp-portfolios.json")
const portfoliosByUsername = new Map<string, PortfolioRecord>()
let jobMatchSequence = 1

function loadPortfoliosFromDisk() {
  try {
    const raw = fs.readFileSync(PORTFOLIO_STORE_FILE, "utf8")
    const parsed = JSON.parse(raw) as Record<string, PortfolioRecord>
    portfoliosByUsername.clear()

    for (const [username, record] of Object.entries(parsed)) {
      if (record && typeof record === "object") {
        portfoliosByUsername.set(username, record)
      }
    }
  } catch {
    // Ignore missing/corrupt file and keep in-memory map.
  }
}

function persistPortfoliosToDisk() {
  try {
    const snapshot = Object.fromEntries(portfoliosByUsername.entries())
    fs.writeFileSync(PORTFOLIO_STORE_FILE, JSON.stringify(snapshot), "utf8")
  } catch {
    // Best-effort persistence only.
  }
}

export function deployPortfolio(username: string, template: string, resumeJson: Record<string, unknown>): PortfolioRecord {
  if (!portfoliosByUsername.size) {
    loadPortfoliosFromDisk()
  }

  const normalizedUsername = username.toLowerCase()

  const record: PortfolioRecord = {
    username: normalizedUsername,
    template,
    resume_json: resumeJson,
    is_public: true,
  }

  portfoliosByUsername.set(normalizedUsername, record)
  persistPortfoliosToDisk()
  return record
}

export function getPortfolio(username: string): PortfolioRecord | null {
  if (!portfoliosByUsername.size) {
    loadPortfoliosFromDisk()
  }

  const normalizedUsername = username.toLowerCase()
  const record = portfoliosByUsername.get(normalizedUsername)

  if (!record || !record.is_public) {
    return null
  }

  return record
}

export function storeJobMatch(
  jobDescription: string,
  originalScore: number,
  improvedScore: number,
  improvedResumeJson: Record<string, unknown>,
  analysisText: string
) {
  const id = jobMatchSequence
  jobMatchSequence += 1

  return {
    id,
    job_description: jobDescription,
    original_score: originalScore,
    improved_score: improvedScore,
    improved_resume_json: improvedResumeJson,
    analysis_text: analysisText,
    created_at: new Date().toISOString(),
  }
}
