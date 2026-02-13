import { ResumeData, resumeSchema } from "@/lib/resume-schema"

export type ResumeValidationResult = {
  missingPaths: string[]
  isValid: boolean
}

function hasValue(value: string) {
  return value.trim().length > 0
}

export function validateResumeForDeployment(data: ResumeData): ResumeValidationResult {
  const missingPaths: string[] = []

  if (!hasValue(data.personal.name)) missingPaths.push("personal.name")
  if (!hasValue(data.personal.title)) missingPaths.push("personal.title")
  if (!hasValue(data.personal.summary)) missingPaths.push("personal.summary")
  if (!hasValue(data.contact.email)) missingPaths.push("contact.email")
  if (!hasValue(data.contact.location)) missingPaths.push("contact.location")

  if (!data.experience.length && !data.projects.length) {
    missingPaths.push("experience|projects")
  }

  if (!data.skills.length) {
    missingPaths.push("skills")
  }

  const schemaResult = resumeSchema.safeParse(data)
  if (!schemaResult.success) {
    schemaResult.error.issues.forEach((issue) => {
      const path = issue.path.join(".")
      if (path && !missingPaths.includes(path)) {
        missingPaths.push(path)
      }
    })
  }

  return {
    missingPaths,
    isValid: missingPaths.length === 0
  }
}
