import { ResumeData } from "@/lib/resume-schema"

export type ConfidenceEntry = {
  score: number
  reason: string
}

export type ConfidenceMap = Record<string, ConfidenceEntry>

function isWeakText(value: string, minLength = 3) {
  const cleaned = value.trim()
  return cleaned.length < minLength || ["n/a", "na", "none", "-", "unknown"].includes(cleaned.toLowerCase())
}

function addLowConfidence(map: ConfidenceMap, path: string, reason: string, score = 0.35) {
  map[path] = { score, reason }
}

export function inferConfidenceMap(data: ResumeData): ConfidenceMap {
  const map: ConfidenceMap = {}

  if (isWeakText(data.personal.name, 2)) addLowConfidence(map, "personal.name", "Name looks incomplete")
  if (isWeakText(data.personal.title, 3)) addLowConfidence(map, "personal.title", "Title looks incomplete")
  if (isWeakText(data.personal.summary, 20)) addLowConfidence(map, "personal.summary", "Summary is too short")

  if (!data.contact.email.includes("@")) {
    addLowConfidence(map, "contact.email", "Email is missing or malformed")
  }

  if (isWeakText(data.contact.phone, 7)) addLowConfidence(map, "contact.phone", "Phone number looks incomplete")
  if (isWeakText(data.contact.location, 2)) addLowConfidence(map, "contact.location", "Location is missing")

  data.experience.forEach((item, index) => {
    if (isWeakText(item.company, 2)) addLowConfidence(map, `experience.${index}.company`, "Company is incomplete")
    if (isWeakText(item.role, 2)) addLowConfidence(map, `experience.${index}.role`, "Role is incomplete")
    if (isWeakText(item.description, 20)) addLowConfidence(map, `experience.${index}.description`, "Description is too short")
  })

  data.projects.forEach((project, index) => {
    if (isWeakText(project.name, 2)) addLowConfidence(map, `projects.${index}.name`, "Project name is incomplete")
    if (isWeakText(project.description, 20)) {
      addLowConfidence(map, `projects.${index}.description`, "Project description is too short")
    }
    if (!project.tech.length) addLowConfidence(map, `projects.${index}.tech`, "No technologies listed")
  })

  if (!data.skills.length) addLowConfidence(map, "skills", "No skills detected")

  return map
}

export function isLowConfidenceField(confidenceMap: ConfidenceMap, path: string) {
  return Boolean(confidenceMap[path])
}
