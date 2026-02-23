import { getServerConfig } from "@/lib/server/config"
import { normalizeJobMatchResult, type JobMatchResult } from "@/lib/server/job-match"

function asObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, unknown>
}

function summarizeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return "Unknown error"
}

function unwrapN8nPayload(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input[0] ?? {}
  }

  const root = asObject(input)
  if (Object.keys(root).length === 0) {
    return input
  }

  if (root.originalScore !== undefined || root.improvedResume !== undefined) {
    return root
  }

  if (root.body !== undefined) return root.body
  if (root.data !== undefined) return root.data
  if (root.result !== undefined) return root.result
  if (root.output !== undefined) return root.output

  return root
}

async function postJsonToWebhook(url: string, payload: Record<string, unknown>): Promise<unknown> {
  const config = getServerConfig()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), config.n8nTimeoutMs)

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.n8nWebhookSecret ? { "x-workflow-secret": config.n8nWebhookSecret } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`n8n webhook failed with status ${response.status}: ${detail}`)
    }

    const text = await response.text()
    if (!text.trim()) {
      throw new Error("n8n webhook returned an empty body.")
    }

    try {
      return JSON.parse(text) as unknown
    } catch {
      throw new Error("n8n webhook returned non-JSON response.")
    }
  } finally {
    clearTimeout(timer)
  }
}

export async function tryEvaluateJobMatchWithN8n(input: {
  resumeData: Record<string, unknown>
  jobDescription: string
}): Promise<JobMatchResult | null> {
  const config = getServerConfig()
  if (!config.n8nJobMatchWebhookUrl) {
    return null
  }

  try {
    const raw = await postJsonToWebhook(config.n8nJobMatchWebhookUrl, {
      resumeData: input.resumeData,
      jobDescription: input.jobDescription,
      source: "job-match-api",
    })
    const normalized = unwrapN8nPayload(raw)
    return normalizeJobMatchResult(normalized, input.resumeData)
  } catch (error) {
    console.warn("job-match-n8n-fallback", summarizeError(error))
    return null
  }
}
