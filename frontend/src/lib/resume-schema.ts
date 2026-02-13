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

export function normalizeResumeData(input: unknown): ResumeData {
  const parsed = resumeSchema.partial().safeParse(input)

  if (!parsed.success) {
    return emptyResumeData
  }

  const raw = parsed.data
  const personal = {
    ...emptyResumeData.personal,
    ...(raw.personal ?? {})
  }

  // Keep `photo` and `primaryPhoto` aligned for compatibility.
  if (!personal.primaryPhoto && personal.photo) {
    personal.primaryPhoto = personal.photo
  }
  if (!personal.photo && personal.primaryPhoto) {
    personal.photo = personal.primaryPhoto
  }

  return {
    ...emptyResumeData,
    ...raw,
    personal,
    contact: { ...emptyResumeData.contact, ...(raw.contact ?? {}) },
    links: { ...emptyResumeData.links, ...(raw.links ?? {}) },
    experience: raw.experience ?? [],
    projects: raw.projects ?? [],
    skills: raw.skills ?? [],
    education: raw.education ?? []
  }
}
