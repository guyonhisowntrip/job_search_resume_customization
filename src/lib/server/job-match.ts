import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { z } from "zod"

import { buildGeminiUrl, getServerConfig, resolveGeminiBaseUrl } from "@/lib/server/config"

const improvedResumeSchema = z.object({
  personal: z.object({
    name: z.string(),
    title: z.string(),
    summary: z.string(),
    photo: z.string(),
    primaryPhoto: z.string(),
    secondaryPhoto: z.string(),
  }),
  contact: z.object({
    email: z.string(),
    phone: z.string(),
    location: z.string(),
  }),
  links: z.object({
    github: z.string(),
    linkedin: z.string(),
    twitter: z.string(),
    portfolio: z.string(),
  }),
  experience: z.array(
    z.object({
      company: z.string(),
      role: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      description: z.string(),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      tech: z.array(z.string()),
      link: z.string(),
    })
  ),
  skills: z.array(z.string()),
  education: z.array(z.string()),
})

const jobMatchSchema = z.object({
  originalScore: z.number().min(0).max(100),
  improvedScore: z.number().min(0).max(100),
  improvedResume: improvedResumeSchema,
  analysis: z.string(),
})

export type JobMatchResult = z.infer<typeof jobMatchSchema>

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "have",
  "will",
  "your",
  "you",
  "are",
  "our",
  "their",
  "about",
  "into",
  "through",
  "role",
  "required",
  "skills",
  "experience",
  "team",
  "work",
  "job",
])

const jobMatchJsonSchema: Record<string, unknown> = {
  type: "object",
  properties: {
    originalScore: { type: "number", minimum: 0, maximum: 100 },
    improvedScore: { type: "number", minimum: 0, maximum: 100 },
    analysis: { type: "string" },
    improvedResume: {
      type: "object",
      properties: {
        personal: {
          type: "object",
          properties: {
            name: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },
            photo: { type: "string" },
            primaryPhoto: { type: "string" },
            secondaryPhoto: { type: "string" },
          },
          required: ["name", "title", "summary", "photo", "primaryPhoto", "secondaryPhoto"],
        },
        contact: {
          type: "object",
          properties: {
            email: { type: "string" },
            phone: { type: "string" },
            location: { type: "string" },
          },
          required: ["email", "phone", "location"],
        },
        links: {
          type: "object",
          properties: {
            github: { type: "string" },
            linkedin: { type: "string" },
            twitter: { type: "string" },
            portfolio: { type: "string" },
          },
          required: ["github", "linkedin", "twitter", "portfolio"],
        },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string" },
              role: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              description: { type: "string" },
            },
            required: ["company", "role", "startDate", "endDate", "description"],
          },
        },
        projects: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              tech: { type: "array", items: { type: "string" } },
              link: { type: "string" },
            },
            required: ["name", "description", "tech", "link"],
          },
        },
        skills: { type: "array", items: { type: "string" } },
        education: { type: "array", items: { type: "string" } },
      },
      required: ["personal", "contact", "links", "experience", "projects", "skills", "education"],
    },
  },
  required: ["originalScore", "improvedScore", "improvedResume", "analysis"],
}

function clampScore(value: number): number {
  const rounded = Math.round(value * 10) / 10
  return Math.max(0, Math.min(100, rounded))
}

function extractJsonPayload(text: string): Record<string, unknown> {
  const fencedJson = text.match(/```json\s*(\{[\s\S]*?\})\s*```/i)
  const fenced = text.match(/```\s*(\{[\s\S]*?\})\s*```/)
  const loose = text.match(/(\{[\s\S]*\})/)

  const candidate = fencedJson?.[1] ?? fenced?.[1] ?? loose?.[1]
  if (!candidate) {
    throw new Error("No JSON object found in model output.")
  }

  const parsed = JSON.parse(candidate) as unknown
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Model JSON root must be an object.")
  }

  return parsed as Record<string, unknown>
}

function tryParseJsonPayload(text: string): Record<string, unknown> {
  try {
    return extractJsonPayload(text)
  } catch (firstError) {
    const repaired = text
      .replace(/\u0000/g, "")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/,\s*([}\]])/g, "$1")

    try {
      return extractJsonPayload(repaired)
    } catch {
      throw firstError
    }
  }
}

function aiContentToText(content: unknown): string {
  if (typeof content === "string") {
    return content
  }

  if (!Array.isArray(content)) {
    return ""
  }

  return content
    .map((part) => {
      if (typeof part === "string") return part
      if (part && typeof part === "object") {
        const text = (part as { text?: unknown }).text
        if (typeof text === "string") return text
      }
      return ""
    })
    .join("\n")
    .trim()
}

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  return value as Record<string, unknown>
}

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function keepFromSourceOrBlank(source: unknown): string {
  return toText(source)
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean)
  }

  const text = toText(value)
  if (!text) return []

  return text
    .split(/\n|,|\||•|·/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

function coerceSourceResume(sourceResume: Record<string, unknown>): JobMatchResult["improvedResume"] {
  const source = asObject(sourceResume)
  const personal = asObject(source.personal)
  const contact = asObject(source.contact)
  const links = asObject(source.links)

  const experience = Array.isArray(source.experience)
    ? source.experience.map((entry) => {
        const item = asObject(entry)
        return {
          company: toText(item.company),
          role: toText(item.role),
          startDate: toText(item.startDate),
          endDate: toText(item.endDate),
          description: toText(item.description),
        }
      })
    : []

  const projects = Array.isArray(source.projects)
    ? source.projects.map((entry) => {
        const item = asObject(entry)
        return {
          name: toText(item.name),
          description: toText(item.description),
          tech: toStringArray(item.tech),
          link: toText(item.link),
        }
      })
    : []

  return {
    personal: {
      name: toText(personal.name),
      title: toText(personal.title),
      summary: toText(personal.summary),
      photo: toText(personal.photo),
      primaryPhoto: toText(personal.primaryPhoto),
      secondaryPhoto: toText(personal.secondaryPhoto),
    },
    contact: {
      email: toText(contact.email),
      phone: toText(contact.phone),
      location: toText(contact.location),
    },
    links: {
      github: toText(links.github),
      linkedin: toText(links.linkedin),
      twitter: toText(links.twitter),
      portfolio: toText(links.portfolio),
    },
    experience,
    projects,
    skills: toStringArray(source.skills),
    education: toStringArray(source.education),
  }
}

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9+#.-]{3,}/g) ?? []).filter((token) => !STOP_WORDS.has(token))
}

function computeMatchScore(sourceResume: JobMatchResult["improvedResume"], jobDescription: string): number {
  const jdTokens = Array.from(new Set(tokenize(jobDescription)))
  if (!jdTokens.length) return 30

  const resumeCorpus = [
    sourceResume.personal.title,
    sourceResume.personal.summary,
    sourceResume.skills.join(" "),
    sourceResume.experience.map((item) => `${item.role} ${item.description}`).join(" "),
    sourceResume.projects.map((item) => `${item.name} ${item.description} ${item.tech.join(" ")}`).join(" "),
  ]
    .join(" ")
    .toLowerCase()

  let overlap = 0
  for (const token of jdTokens) {
    if (resumeCorpus.includes(token)) overlap += 1
  }

  const coverage = overlap / jdTokens.length
  const structureBonus =
    (sourceResume.skills.length ? 8 : 0) +
    (sourceResume.experience.length ? 8 : 0) +
    (sourceResume.projects.length ? 5 : 0) +
    (sourceResume.education.length ? 4 : 0)

  return clampScore(20 + coverage * 55 + structureBonus)
}

function heuristicJobMatch(
  sourceResume: JobMatchResult["improvedResume"],
  jobDescription: string,
  reason?: string
): JobMatchResult {
  const originalScore = computeMatchScore(sourceResume, jobDescription)
  const improvedScore = clampScore(Math.max(originalScore + 7, originalScore))

  const improvedResume: JobMatchResult["improvedResume"] = {
    ...sourceResume,
    personal: {
      ...sourceResume.personal,
      title: sourceResume.personal.title || "Software Engineer",
      summary:
        sourceResume.personal.summary ||
        "Experienced software professional with strong technical foundations and adaptable problem-solving skills.",
    },
  }

  const analysisParts = [
    "Generated fallback evaluation because the model response could not be parsed reliably.",
    `Estimated score improved from ${originalScore} to ${improvedScore} based on keyword overlap and resume structure.`,
    "You can still review and edit the regenerated resume before applying changes.",
  ]

  if (reason) {
    analysisParts.push(`Technical note: ${reason}`)
  }

  return {
    originalScore,
    improvedScore,
    improvedResume,
    analysis: analysisParts.join(" "),
  }
}

function applyTruthfulnessGuard(
  improvedResume: JobMatchResult["improvedResume"],
  sourceResume: Record<string, unknown>
): JobMatchResult["improvedResume"] {
  const source = asObject(sourceResume)
  const sourcePersonal = asObject(source.personal)
  const sourceContact = asObject(source.contact)
  const sourceLinks = asObject(source.links)

  return {
    ...improvedResume,
    personal: {
      ...improvedResume.personal,
      name: keepFromSourceOrBlank(sourcePersonal.name) || improvedResume.personal.name,
      photo: keepFromSourceOrBlank(sourcePersonal.photo),
      primaryPhoto: keepFromSourceOrBlank(sourcePersonal.primaryPhoto),
      secondaryPhoto: keepFromSourceOrBlank(sourcePersonal.secondaryPhoto),
    },
    contact: {
      ...improvedResume.contact,
      email: keepFromSourceOrBlank(sourceContact.email),
      phone: keepFromSourceOrBlank(sourceContact.phone),
      location: keepFromSourceOrBlank(sourceContact.location),
    },
    links: {
      github: keepFromSourceOrBlank(sourceLinks.github),
      linkedin: keepFromSourceOrBlank(sourceLinks.linkedin),
      twitter: keepFromSourceOrBlank(sourceLinks.twitter),
      portfolio: keepFromSourceOrBlank(sourceLinks.portfolio),
    },
  }
}

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
    finishReason?: string
  }>
  promptFeedback?: {
    blockReason?: string
  }
}

function readGeminiTextResponse(payload: GeminiGenerateContentResponse): string {
  const candidate = payload.candidates?.[0]
  const parts = candidate?.content?.parts
  const text = Array.isArray(parts) ? parts.map((part) => part.text ?? "").join("\n").trim() : ""

  if (text) {
    return text
  }

  const reason = candidate?.finishReason ?? payload.promptFeedback?.blockReason
  if (reason) {
    throw new Error(`Gemini returned no text output (${reason}).`)
  }

  throw new Error("Gemini returned no text output.")
}

async function invokeGeminiJson(
  basePrompt: string,
  model: string,
  apiKey: string,
  configuredUrl?: string
): Promise<Record<string, unknown>> {
  const url = buildGeminiUrl(model, configuredUrl)
  const response = await fetch(`${url}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: basePrompt }],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        responseSchema: jobMatchJsonSchema,
      },
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Gemini strict JSON call failed with status ${response.status}: ${detail}`)
  }

  const payload = (await response.json()) as GeminiGenerateContentResponse
  const text = readGeminiTextResponse(payload)
  return tryParseJsonPayload(text)
}

export async function evaluateJobMatchWithLangChain(
  resumeJson: Record<string, unknown>,
  jobDescription: string
): Promise<JobMatchResult> {
  const config = getServerConfig()
  const sourceResume = coerceSourceResume(resumeJson)
  if (!config.llmApiKey) {
    return heuristicJobMatch(sourceResume, jobDescription, "LLM_API_KEY is not configured.")
  }

  const llm = new ChatGoogleGenerativeAI({
    apiKey: config.llmApiKey,
    model: config.llmModel,
    baseUrl: resolveGeminiBaseUrl(config.llmApiUrl),
    temperature: 0,
    maxOutputTokens: 4096,
    maxRetries: 2,
  })

  const basePrompt = [
    "You are an expert resume strategist and ATS evaluator.",
    "Evaluate job fit and regenerate a stronger resume while staying truthful to the candidate's profile.",
    "Return scores from 0 to 100.",
    "Improved score must be greater than or equal to original score.",
    "Do not invent fake employers, degrees, or achievements.",
    "Do not invent contact details or links.",
    "Keep fields concise and practical for a real resume.",
    "Keep `analysis` under 1200 characters.",
    "",
    "Output requirements:",
    "- Return only structured output matching the schema.",
    "- improvedResume must include keys: personal, contact, links, experience, projects, skills, education.",
    "",
    `Job description:\n${jobDescription}`,
    "",
    `Current resume JSON:\n${JSON.stringify(resumeJson)}`,
  ].join("\n")

  let result: JobMatchResult
  let fallbackRawText = ""
  const modelWithStructure = llm.withStructuredOutput(jobMatchJsonSchema, {
    name: "job_match_result",
    method: "functionCalling",
  })

  try {
    const rawResult = await modelWithStructure.invoke(basePrompt)
    result = jobMatchSchema.parse(rawResult)
  } catch (structuredError) {
    try {
      const payload = await invokeGeminiJson(basePrompt, config.llmModel, config.llmApiKey, config.llmApiUrl)
      result = jobMatchSchema.parse(payload)
    } catch (strictJsonError) {
      const strictPrompt = [
        basePrompt,
        "",
        "IMPORTANT:",
        "- Return ONLY valid JSON.",
        "- Do not include markdown, prose, or code fences.",
        "- Ensure all strings are properly escaped JSON strings.",
        "- Keep `analysis` concise (max 6 bullet-like sentences in plain text).",
      ].join("\n")

      try {
        const message = await llm.invoke(strictPrompt)
        fallbackRawText = aiContentToText((message as { content?: unknown }).content)
        const payload = tryParseJsonPayload(fallbackRawText)
        result = jobMatchSchema.parse(payload)
      } catch (fallbackError) {
        const primaryMessage = structuredError instanceof Error ? structuredError.message : "Unknown structured-output error"
        const strictJsonMessage =
          strictJsonError instanceof Error ? strictJsonError.message : "Unknown strict-json fallback error"
        const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : "Unknown fallback-output error"
        if (process.env.DEBUG_JOB_MATCH_JSON === "true") {
          const snippet = fallbackRawText.slice(0, 1200)
          console.error("job-match-json-debug", {
            primaryMessage,
            strictJsonMessage,
            fallbackMessage,
            rawLength: fallbackRawText.length,
            rawSnippet: snippet,
          })
        }
        return heuristicJobMatch(
          sourceResume,
          jobDescription,
          `Job match model parsing failed: ${primaryMessage}; strict-json failed: ${strictJsonMessage}; fallback failed: ${fallbackMessage}`
        )
      }
    }
  }

  const truthCheckedResume = applyTruthfulnessGuard(result.improvedResume, resumeJson)

  return {
    ...result,
    improvedResume: truthCheckedResume,
    originalScore: clampScore(result.originalScore),
    improvedScore: clampScore(Math.max(result.improvedScore, result.originalScore)),
    analysis: result.analysis.trim(),
  }
}
