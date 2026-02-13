"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CheckCircle2, Sparkles, TriangleAlert } from "lucide-react"

import { WizardShell } from "@/components/layout/wizard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useWizard } from "@/context/wizard-context"
import { evaluateJobMatch, updateResume } from "@/lib/api"
import { normalizeResumeData } from "@/lib/resume-schema"

type JobMatchResult = {
  originalScore: number
  improvedScore: number
  improvedResume: unknown
  analysis: string
}

function scoreTone(score: number) {
  if (score < 50) {
    return "border-[#f0b5a7] bg-[#fff1ed] text-[#9b3d2a]"
  }
  if (score <= 75) {
    return "border-[#f0d5a0] bg-[#fff8e8] text-[#8a5a16]"
  }
  return "border-[#b6e3c7] bg-[#f0fbf5] text-[#2f6f4c]"
}

export default function JobMatchPage() {
  const { resumeData, setResumeData, username } = useWizard()

  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<JobMatchResult | null>(null)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const canEvaluate = useMemo(() => {
    return jobDescription.trim().length > 0 && !isLoading
  }, [jobDescription, isLoading])

  async function handleEvaluate() {
    if (!canEvaluate) {
      return
    }

    if (!username.trim()) {
      setError("Add a username in the Deploy step so we can attach results to your account.")
      return
    }

    setError("")
    setStatus("Syncing your latest resume")
    setIsLoading(true)

    try {
      await updateResume({ username, resumeData })

      setStatus("Evaluating job fit with n8n")
      const response = await evaluateJobMatch({ username, jobDescription })
      setResult({
        originalScore: response.originalScore,
        improvedScore: response.improvedScore,
        improvedResume: response.improvedResume,
        analysis: response.analysis
      })
      setStatus("Evaluation complete")
    } catch (evaluateError) {
      setError(evaluateError instanceof Error ? evaluateError.message : "Job match evaluation failed")
      setStatus("")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApplyImproved() {
    if (!result) {
      return
    }

    setIsApplying(true)
    setError("")
    setStatus("Applying improved resume")

    try {
      const normalized = normalizeResumeData(result.improvedResume)
      setResumeData(normalized)
      if (username.trim()) {
        await updateResume({ username, resumeData: normalized })
      }
      setStatus("Improved resume applied")
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : "Failed to apply improved resume")
      setStatus("")
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <WizardShell
      title="AI Job Match"
      description="Paste a job description to score your fit, receive targeted improvements, and optionally apply the improved resume."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/preview" className="text-sm font-semibold text-[#2b557e] hover:text-[#16395b]">
            Back to Preview
          </Link>
          <Link href="/deploy" className="text-sm font-semibold text-[#2b557e] hover:text-[#16395b]">
            Skip to Deploy
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#10243e]">Job Description</h2>
              <p className="mt-1 text-sm text-[#58708a]">
                Paste the role requirements and responsibilities. We will send your resume + JD to the n8n workflow.
              </p>
            </div>
            {username ? <Badge tone="neutral">User: {username}</Badge> : <Badge tone="warning">Username required</Badge>}
          </div>

          <div className="mt-4 grid gap-3">
            <Textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job description here..."
              rows={10}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleEvaluate} disabled={!canEvaluate || isLoading}>
                <Sparkles className="mr-1.5 h-4 w-4" />
                {isLoading ? "Evaluating..." : "Evaluate Fit"}
              </Button>
              <p className="text-xs text-[#6d8399]">We never send your resume directly from the frontend.</p>
            </div>
          </div>

          {status ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#c9d9e8] bg-[#f4f9ff] px-3 py-2 text-sm text-[#365a7f]">
              <CheckCircle2 className="h-4 w-4" />
              {status}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#f0c1b5] bg-[#fff3ef] px-3 py-2 text-sm text-[#9c412f]">
              <TriangleAlert className="h-4 w-4" />
              {error}
            </div>
          ) : null}
        </Card>

        <Card className="flex h-full flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#10243e]">Match Results</h2>
            <p className="mt-1 text-sm text-[#58708a]">Scores update once the n8n workflow responds.</p>
          </div>

          {result ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${scoreTone(result.originalScore)}`}>
                  Original Score
                  <div className="mt-1 text-2xl font-semibold">{Math.round(result.originalScore)}</div>
                </div>
                <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${scoreTone(result.improvedScore)}`}>
                  Improved Score
                  <div className="mt-1 text-2xl font-semibold">{Math.round(result.improvedScore)}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#d7e1ec] bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-[#1b3a5a]">Improvement Suggestions</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[#3f5873]">{result.analysis}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleApplyImproved} disabled={isApplying}>
                  {isApplying ? "Applying..." : "Apply Improved Resume"}
                </Button>
                <Link
                  href="/edit"
                  className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
                >
                  Review in Editor
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#c5d4e3] bg-[#f6f9fd] px-4 py-6 text-sm text-[#6b8198]">
              Run an evaluation to see your fit score and recommendations.
            </div>
          )}
        </Card>
      </div>
    </WizardShell>
  )
}
