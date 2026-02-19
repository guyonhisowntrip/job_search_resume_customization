export type JobMatchResult = {
  originalScore: number
  improvedScore: number
  improvedResume: unknown
  analysis: string
  createdAt?: string
}

export type ApplyModalMode = "apply" | "save-version" | null
