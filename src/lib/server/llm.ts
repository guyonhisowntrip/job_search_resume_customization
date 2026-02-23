import { buildGeminiUrl, getServerConfig } from "@/lib/server/config"
import { normalizeResumeData, type ResumeData } from "@/lib/resume-schema"

function extractJsonPayload(text: string): Record<string, unknown> {
  const fencedJson = text.match(/```json\s*(\{[\s\S]*?\})\s*```/i)
  const fenced = text.match(/```\s*(\{[\s\S]*?\})\s*```/)
  const loose = text.match(/(\{[\s\S]*\})/)

  const candidate = fencedJson?.[1] ?? fenced?.[1] ?? loose?.[1]
  if (!candidate) {
    throw new Error("No JSON object found in LLM response.")
  }

  const parsed = JSON.parse(candidate) as unknown
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("LLM response JSON root must be an object.")
  }

  return parsed as Record<string, unknown>
}

function hasResumeContent(resume: ResumeData): boolean {
  const hasPersonal = Boolean(resume.personal.name || resume.personal.title || resume.personal.summary)
  const hasContact = Boolean(resume.contact.email || resume.contact.phone || resume.contact.location)
  const hasStructuredSections =
    resume.experience.length > 0 || resume.projects.length > 0 || resume.skills.length > 0 || resume.education.length > 0

  return hasPersonal || hasContact || hasStructuredSections
}

function mergeResumeData(primary: ResumeData, fallback: ResumeData): ResumeData {
  return {
    personal: {
      name: primary.personal.name || fallback.personal.name,
      title: primary.personal.title || fallback.personal.title,
      summary: primary.personal.summary || fallback.personal.summary,
      photo: primary.personal.photo || fallback.personal.photo,
      primaryPhoto: primary.personal.primaryPhoto || fallback.personal.primaryPhoto,
      secondaryPhoto: primary.personal.secondaryPhoto || fallback.personal.secondaryPhoto,
    },
    contact: {
      email: primary.contact.email || fallback.contact.email,
      phone: primary.contact.phone || fallback.contact.phone,
      location: primary.contact.location || fallback.contact.location,
    },
    links: {
      github: primary.links.github || fallback.links.github,
      linkedin: primary.links.linkedin || fallback.links.linkedin,
      twitter: primary.links.twitter || fallback.links.twitter,
      portfolio: primary.links.portfolio || fallback.links.portfolio,
    },
    experience: primary.experience.length ? primary.experience : fallback.experience,
    projects: primary.projects.length ? primary.projects : fallback.projects,
    skills: primary.skills.length ? primary.skills : fallback.skills,
    education: primary.education.length ? primary.education : fallback.education,
  }
}

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function findSectionLines(lines: string[], headings: string[], maxLines = 14): string[] {
  const headingMatcher = new RegExp(`^(${headings.join("|")})\\b[: ]*$`, "i")
  const genericHeadingMatcher =
    /^(summary|profile|experience|work experience|employment|projects?|skills?|education|certifications?|contact|links?)\b[: ]*$/i

  const startIndex = lines.findIndex((line) => headingMatcher.test(line))
  if (startIndex < 0) return []

  const collected: string[] = []
  for (let idx = startIndex + 1; idx < lines.length && collected.length < maxLines; idx += 1) {
    const line = lines[idx]
    if (genericHeadingMatcher.test(line)) {
      break
    }
    collected.push(line)
  }

  return collected
}

function heuristicExtractFromText(resumeText: string): ResumeData {
  const lines = splitLines(resumeText)

  const emailMatch = resumeText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)?.[0] ?? ""
  const phoneMatch =
    resumeText.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g)?.[0] ?? ""

  const urlMatches = Array.from(new Set(resumeText.match(/(?:https?:\/\/|www\.)[^\s)]+/gi) ?? []))
  const github = urlMatches.find((url) => /github\.com/i.test(url)) ?? ""
  const linkedin = urlMatches.find((url) => /linkedin\.com/i.test(url)) ?? ""
  const twitter = urlMatches.find((url) => /twitter\.com|x\.com/i.test(url)) ?? ""
  const portfolio = urlMatches.find((url) => !/github\.com|linkedin\.com|twitter\.com|x\.com/i.test(url)) ?? ""

  const headingLike = /^(summary|profile|experience|work experience|employment|projects?|skills?|education|certifications?|contact|links?)\b/i
  const topLines = lines.slice(0, 8).filter((line) => !headingLike.test(line))

  const name = topLines.find((line) => /^[A-Za-z][A-Za-z .'-]{2,40}$/.test(line) && line.split(/\s+/).length <= 5) ?? ""
  const title =
    topLines.find(
      (line) =>
        /(engineer|developer|designer|manager|analyst|consultant|architect|specialist|lead|intern|scientist)/i.test(line)
    ) ?? ""

  const summaryLines = findSectionLines(lines, ["summary", "profile"], 5)
  const summary = summaryLines.join(" ") || topLines.slice(2, 5).join(" ")

  const skillsSection = findSectionLines(lines, ["skills", "technical skills"], 10)
  const skills = skillsSection
    .join(" | ")
    .split(/,|\||•|·/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 1)

  const educationSection = findSectionLines(lines, ["education", "academic background"], 8)
  const education = educationSection.filter((line) => line.length > 2)

  const experienceSection = findSectionLines(lines, ["experience", "work experience", "employment"], 20)
  const experience = experienceSection
    .filter((line) => line.length > 5)
    .slice(0, 6)
    .map((line) => ({
      company: "",
      role: line,
      startDate: "",
      endDate: "",
      description: line,
    }))

  return normalizeResumeData({
    personal: {
      name,
      title,
      summary,
    },
    contact: {
      email: emailMatch,
      phone: phoneMatch,
      location: "",
    },
    links: {
      github,
      linkedin,
      twitter,
      portfolio,
    },
    experience,
    projects: [],
    skills,
    education,
  })
}

function buildPrompt(resumeText: string): string {
  return [
    "You are a resume parser. Extract ALL relevant details from the resume text.",
    "Return ONLY valid JSON (no markdown, no code fences, no commentary).",
    "Use empty strings or empty arrays when a field is missing.",
    "Keep descriptions concise.",
    "If an email/URL is unclear, return an empty string instead of invalid format.",
    "",
    "Schema:",
    '{"personal":{"name":"","title":"","summary":"","photo":"","primaryPhoto":"","secondaryPhoto":""},"contact":{"email":"","phone":"","location":""},"links":{"github":"","linkedin":"","twitter":"","portfolio":""},"experience":[{"company":"","role":"","startDate":"","endDate":"","description":""}],"projects":[{"name":"","description":"","tech":[""],"link":""}],"skills":[""],"education":[""]}',
    "",
    "Resume text:",
    resumeText,
  ].join("\n")
}

async function callGemini(prompt: string): Promise<string> {
  const config = getServerConfig()

  if (!config.llmApiKey) {
    throw new Error("LLM_API_KEY (Gemini API key) is not configured.")
  }

  const url = buildGeminiUrl(config.llmModel, config.llmApiUrl)

  const response = await fetch(`${url}?key=${encodeURIComponent(config.llmApiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Gemini resume parsing failed with status ${response.status}: ${detail}`)
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }

  const parts = data.candidates?.[0]?.content?.parts
  if (!parts || !Array.isArray(parts)) {
    throw new Error("Gemini response did not include candidate content.")
  }

  return parts.map((part) => part.text ?? "").join("\n").trim()
}

export async function extractResumeJson(resumeText: string): Promise<ResumeData> {
  const fallback = heuristicExtractFromText(resumeText)
  const schemaPrompt = buildPrompt(resumeText)
  const strictPrompt = `${schemaPrompt}\n\nIMPORTANT: Output ONLY a JSON object. No prose, no markdown. Start with '{' and end with '}'.`

  let llmText = ""

  try {
    llmText = await callGemini(schemaPrompt)
    const normalized = normalizeResumeData(extractJsonPayload(llmText))
    const merged = mergeResumeData(normalized, fallback)

    if (hasResumeContent(merged)) {
      return merged
    }
  } catch {
    // Fall through to strict retry and fallback handling.
  }

  try {
    llmText = await callGemini(strictPrompt)
    const normalized = normalizeResumeData(extractJsonPayload(llmText))
    const merged = mergeResumeData(normalized, fallback)

    if (hasResumeContent(merged)) {
      return merged
    }
  } catch {
    // Fall through to heuristic fallback.
  }

  if (hasResumeContent(fallback)) {
    return fallback
  }

  throw new Error("Resume parsing failed: could not extract structured resume data from the document.")
}
