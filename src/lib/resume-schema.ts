import { z } from "zod"

const optionalUrl = z.string().url().or(z.literal(""))

export const resumeSchema = z.object({
  personal: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    summary: z.string().min(1),
    // Legacy field kept for backwards compatibility with older payloads.
    photo: optionalUrl,
    primaryPhoto: optionalUrl.optional().default(""),
    secondaryPhoto: optionalUrl.optional().default("")
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().min(1),
    location: z.string().min(1)
  }),
  links: z.object({
    github: optionalUrl,
    linkedin: optionalUrl,
    twitter: optionalUrl,
    portfolio: optionalUrl
  }),
  experience: z.array(
    z.object({
      company: z.string().min(1),
      role: z.string().min(1),
      startDate: z.string().min(1),
      endDate: z.string().min(1),
      description: z.string().min(1)
    })
  ),
  projects: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().min(1),
      tech: z.array(z.string().min(1)),
      link: optionalUrl
    })
  ),
  skills: z.array(z.string().min(1)),
  education: z.array(z.string().min(1))
})

export type ResumeData = z.infer<typeof resumeSchema>

export const emptyResumeData: ResumeData = {
  personal: { name: "", title: "", summary: "", photo: "", primaryPhoto: "", secondaryPhoto: "" },
  contact: { email: "", phone: "", location: "" },
  links: { github: "", linkedin: "", twitter: "", portfolio: "" },
  experience: [],
  projects: [],
  skills: [],
  education: []
}

function asObject(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {}
  }

  return input as Record<string, unknown>
}

function toText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim()
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  return ""
}

function toValidEmail(value: unknown): string {
  const text = toText(value)
  if (!text) return ""
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? text : ""
}

function toValidUrl(value: unknown): string {
  let text = toText(value)
  if (!text) return ""

  if (!/^https?:\/\//i.test(text) && /^www\./i.test(text)) {
    text = `https://${text}`
  }

  try {
    return new URL(text).toString()
  } catch {
    return ""
  }
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item))
      .filter((item) => item.length > 0)
  }

  const text = toText(value)
  if (!text) return []

  return text
    .split(/\n|,|\||•|·/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function normalizeExperience(value: unknown): ResumeData["experience"] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => {
      const item = asObject(entry)
      return {
        company: toText(item.company),
        role: toText(item.role),
        startDate: toText(item.startDate),
        endDate: toText(item.endDate),
        description: toText(item.description)
      }
    })
    .filter((entry) => Boolean(entry.company || entry.role || entry.description))
}

function normalizeProjects(value: unknown): ResumeData["projects"] {
  if (!Array.isArray(value)) return []

  return value
    .map((entry) => {
      const item = asObject(entry)
      return {
        name: toText(item.name),
        description: toText(item.description),
        tech: toStringArray(item.tech),
        link: toValidUrl(item.link)
      }
    })
    .filter((entry) => Boolean(entry.name || entry.description || entry.tech.length))
}

export function normalizeResumeData(input: unknown): ResumeData {
  const root = asObject(input)
  const personalRaw = asObject(root.personal)
  const contactRaw = asObject(root.contact)
  const linksRaw = asObject(root.links)

  const personal: ResumeData["personal"] = {
    name: toText(personalRaw.name || root.name),
    title: toText(personalRaw.title || root.title),
    summary: toText(personalRaw.summary || root.summary),
    photo: toValidUrl(personalRaw.photo),
    primaryPhoto: toValidUrl(personalRaw.primaryPhoto),
    secondaryPhoto: toValidUrl(personalRaw.secondaryPhoto)
  }

  // Keep `photo` and `primaryPhoto` aligned for compatibility.
  if (!personal.primaryPhoto && personal.photo) {
    personal.primaryPhoto = personal.photo
  }
  if (!personal.photo && personal.primaryPhoto) {
    personal.photo = personal.primaryPhoto
  }

  return {
    personal,
    contact: {
      email: toValidEmail(contactRaw.email || root.email),
      phone: toText(contactRaw.phone || root.phone),
      location: toText(contactRaw.location || root.location)
    },
    links: {
      github: toValidUrl(linksRaw.github || root.github),
      linkedin: toValidUrl(linksRaw.linkedin || root.linkedin),
      twitter: toValidUrl(linksRaw.twitter || root.twitter),
      portfolio: toValidUrl(linksRaw.portfolio || root.portfolio)
    },
    experience: normalizeExperience(root.experience),
    projects: normalizeProjects(root.projects),
    skills: toStringArray(root.skills),
    education: toStringArray(root.education)
  }
}
