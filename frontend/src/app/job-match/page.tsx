"use client"

import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { CheckCircle2, FileUp, Loader2, Sparkles, TriangleAlert } from "lucide-react"
import { useMemo, useRef, useState, useTransition } from "react"

import { AnalysisPanel } from "@/components/job-match/analysis-panel"
import { ApplyImprovementModal } from "@/components/job-match/apply-improvement-modal"
import { JobInputSection } from "@/components/job-match/job-input-section"
import { ResumeDiffView } from "@/components/job-match/resume-diff-view"
import { ScoreCard } from "@/components/job-match/score-card"
import { ApplyModalMode, JobMatchResult } from "@/components/job-match/types"
import { WizardShell } from "@/components/layout/wizard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWizard } from "@/context/wizard-context"
import { inferConfidenceMap } from "@/lib/confidence"
import { evaluateJobMatch, parseUploadedResume, uploadResume } from "@/lib/api"
import { normalizeResumeData } from "@/lib/resume-schema"

const VERSION_HISTORY_KEY = "onetapp-resume-version-history"

type ResumeVersionSnapshot = {
  id: string
  createdAt: string
  jobDescription: string
  originalScore: number
  improvedScore: number
  resumeBefore: ReturnType<typeof normalizeResumeData>
  resumeAfter: ReturnType<typeof normalizeResumeData>
}

function JobMatchLoadingSkeleton() {
  return (
    <Card>
      <div className="space-y-4">
        <Skeleton className="h-6 w-44" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    </Card>
  )
}

function EmptyResultState() {
  return (
    <Card className="border-dashed border-[#c5d4e3] bg-[#f6f9fd]">
      <h2 className="text-base font-semibold text-[#1c405f]">No evaluation yet</h2>
      <p className="mt-1 text-sm text-[#607892]">
        Add a job description and run the evaluator to see score deltas, detailed analysis, and resume improvements.
      </p>
    </Card>
  )
}

function saveSnapshot(snapshot: ResumeVersionSnapshot) {
  if (typeof window === "undefined") return

  const existing = window.localStorage.getItem(VERSION_HISTORY_KEY)
  const parsed = existing ? (JSON.parse(existing) as ResumeVersionSnapshot[]) : []
  const next = [snapshot, ...parsed].slice(0, 20)
  window.localStorage.setItem(VERSION_HISTORY_KEY, JSON.stringify(next))
}

function formatEvaluatedTime(value?: string) {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric"
  })
}

function normalizeErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message
  }
  return fallback
}

function hasResumeContent(resume: ReturnType<typeof normalizeResumeData>) {
  const hasPersonal = Boolean(resume.personal.name.trim() || resume.personal.title.trim() || resume.personal.summary.trim())
  const hasContact = Boolean(resume.contact.email.trim() || resume.contact.phone.trim() || resume.contact.location.trim())
  const hasStructuredSections = Boolean(
    resume.experience.length || resume.projects.length || resume.skills.length || resume.education.length
  )
  return hasPersonal || hasContact || hasStructuredSections
}

export default function JobMatchPage() {
  const { resumeData, setResumeData } = useWizard()
  const resumeUploadInputRef = useRef<HTMLInputElement | null>(null)

  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState<JobMatchResult | null>(null)
  const [evaluateError, setEvaluateError] = useState("")
  const [actionError, setActionError] = useState("")
  const [notice, setNotice] = useState("")
  const [resumeUploadStatus, setResumeUploadStatus] = useState("")
  const [resumeUploadError, setResumeUploadError] = useState("")
  const [resumeFileName, setResumeFileName] = useState("")
  const [isUploadingResume, setIsUploadingResume] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalMode, setModalMode] = useState<ApplyModalMode>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [isSavingVersion, setIsSavingVersion] = useState(false)
  const [isTransitionPending, startTransition] = useTransition()

  const hasResume = useMemo(() => hasResumeContent(resumeData), [resumeData])
  const improvedResume = useMemo(() => {
    return result ? normalizeResumeData(result.improvedResume) : null
  }, [result])
  const scoreDelta = result ? result.improvedScore - result.originalScore : 0

  const canEvaluate = useMemo(() => {
    return jobDescription.trim().length > 0 && !isLoading && !isUploadingResume && hasResume
  }, [jobDescription, isLoading, isUploadingResume, hasResume])

  async function handleResumeUpload(file: File | null) {
    if (!file || isUploadingResume) {
      return
    }

    setResumeUploadError("")
    setResumeUploadStatus("Uploading resume")
    setIsUploadingResume(true)

    try {
      const uploadResult = await uploadResume(file)
      setResumeUploadStatus("Parsing and structuring content")

      const parseResult = await parseUploadedResume(uploadResult.uploadId)
      const normalized = normalizeResumeData(parseResult.resumeData)
      setResumeData(normalized)
      setResumeFileName(file.name)

      const lowCount = Object.keys(inferConfidenceMap(normalized)).length
      setResumeUploadStatus(
        lowCount > 0 ? `Resume uploaded with ${lowCount} low-confidence fields.` : "Resume uploaded successfully."
      )
      setNotice("Resume draft refreshed for job match.")
    } catch (uploadError) {
      setResumeUploadError(normalizeErrorMessage(uploadError, "Resume upload failed"))
      setResumeUploadStatus("")
    } finally {
      setIsUploadingResume(false)
    }
  }

  async function handleEvaluate() {
    if (!canEvaluate) {
      return
    }

    const trimmedDescription = jobDescription.trim()
    if (!trimmedDescription) {
      return
    }

    setEvaluateError("")
    setActionError("")
    setNotice("")
    setIsLoading(true)

    try {
      const response = await evaluateJobMatch({ resumeData, jobDescription: trimmedDescription })
      setResult({
        originalScore: response.originalScore,
        improvedScore: response.improvedScore,
        improvedResume: response.improvedResume,
        analysis: response.analysis,
        createdAt: response.createdAt
      })
      setNotice("Evaluation complete. Review the suggested improvements below.")
    } catch (evaluateError) {
      setEvaluateError(normalizeErrorMessage(evaluateError, "Job match evaluation failed"))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleApplyImproved() {
    if (!result || !improvedResume) {
      return
    }

    setActionError("")
    setNotice("")
    setIsApplying(true)

    try {
      startTransition(() => {
        setResumeData(improvedResume)
      })
      setNotice("Improved resume applied to your editor draft.")
      setModalMode(null)
    } catch (applyError) {
      setActionError(normalizeErrorMessage(applyError, "Failed to apply improved resume"))
    } finally {
      setIsApplying(false)
    }
  }

  async function handleSaveAsVersion() {
    if (!result || !improvedResume) {
      return
    }

    setActionError("")
    setNotice("")
    setIsSavingVersion(true)

    try {
      saveSnapshot({
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        jobDescription: jobDescription.trim(),
        originalScore: result.originalScore,
        improvedScore: result.improvedScore,
        resumeBefore: resumeData,
        resumeAfter: improvedResume
      })

      startTransition(() => {
        setResumeData(improvedResume)
      })
      setNotice("Saved as a new version and applied to your active draft.")
      setModalMode(null)
    } catch (saveError) {
      setActionError(normalizeErrorMessage(saveError, "Could not save a new resume version"))
    } finally {
      setIsSavingVersion(false)
    }
  }

  const isActionBusy = isApplying || isSavingVersion || isTransitionPending

  return (
    <WizardShell
      title="AI Job Match & Resume Regenerator"
      description="Run n8n-powered job fit analysis against a real job description, review regenerated content, and apply improvements safely."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-[#2b557e] hover:text-[#16395b]">
            Back to Home
          </Link>
          <Link href="/upload" className="text-sm font-semibold text-[#2b557e] hover:text-[#16395b]">
            Open Portfolio Builder
          </Link>
        </div>
      }
    >
      <div className="grid gap-4">
        <Card className="border-[#d8e3ee] bg-white/90">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[#10243e]">Resume Source</h2>
              <p className="mt-1 text-sm text-[#58708a]">
                Upload a resume PDF here, or use your existing draft from the editor.
              </p>
            </div>
            <Badge tone={hasResume ? "success" : "warning"}>{hasResume ? "Resume loaded" : "No resume loaded"}</Badge>
          </div>

          <input
            ref={resumeUploadInputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(event) => {
              void handleResumeUpload(event.target.files?.[0] ?? null)
              event.currentTarget.value = ""
            }}
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={() => resumeUploadInputRef.current?.click()} disabled={isUploadingResume || isLoading}>
              <FileUp className="mr-1.5 h-4 w-4" />
              {isUploadingResume ? "Processing resume..." : "Upload Resume PDF"}
            </Button>
            <Link
              href="/edit"
              className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
            >
              Open Resume Editor
            </Link>
          </div>

          {resumeFileName ? <p className="mt-3 text-xs text-[#607b96]">Loaded file: {resumeFileName}</p> : null}
          {resumeUploadStatus ? (
            <p className="mt-2 text-xs font-medium text-[#2b6a50]">{resumeUploadStatus}</p>
          ) : null}
          {resumeUploadError ? (
            <div className="mt-3 inline-flex items-start gap-2 rounded-xl border border-[#f0c1b5] bg-[#fff3ef] px-3 py-2 text-sm text-[#9c412f]">
              <TriangleAlert className="mt-0.5 h-4 w-4" />
              <p>{resumeUploadError}</p>
            </div>
          ) : null}
        </Card>

        <JobInputSection
          value={jobDescription}
          onChange={setJobDescription}
          onEvaluate={handleEvaluate}
          isEvaluating={isLoading}
          canEvaluate={canEvaluate}
          error={evaluateError}
        />

        {isLoading ? (
          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#d9e4ef] bg-[#f7fafe] px-3 py-2 text-sm text-[#3f5f80]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Evaluating job fit...
          </div>
        ) : null}

        {!hasResume ? (
          <div className="inline-flex w-fit items-start gap-2 rounded-xl border border-[#f3d9b9] bg-[#fff8ef] px-3 py-2 text-sm text-[#8b5b25]">
            <TriangleAlert className="mt-0.5 h-4 w-4" />
            <p>Upload a resume or add data in the editor before running evaluation.</p>
          </div>
        ) : null}

        {notice ? (
          <div className="inline-flex w-fit items-start gap-2 rounded-xl border border-[#cbe6da] bg-[#ecfbf3] px-3 py-2 text-sm text-[#1f6a4b]">
            <CheckCircle2 className="mt-0.5 h-4 w-4" />
            <p>{notice}</p>
          </div>
        ) : null}

        {actionError ? (
          <div className="inline-flex w-fit items-start gap-2 rounded-xl border border-[#f0c1b5] bg-[#fff3ef] px-3 py-2 text-sm text-[#9c412f]">
            <TriangleAlert className="mt-0.5 h-4 w-4" />
            <p>{actionError}</p>
          </div>
        ) : null}

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="job-match-loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <JobMatchLoadingSkeleton />
            </motion.div>
          ) : result ? (
            <motion.div
              key="job-match-result"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24 }}
              className="grid gap-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="neutral">Current draft</Badge>
                {formatEvaluatedTime(result.createdAt) ? (
                  <Badge tone="neutral">Evaluated {formatEvaluatedTime(result.createdAt)}</Badge>
                ) : null}
                <Badge tone="success">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  AI recommendations ready
                </Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ScoreCard title="Original Score" score={result.originalScore} />
                <ScoreCard title="Improved Score" score={result.improvedScore} previousScore={result.originalScore} />
              </div>

              <AnalysisPanel analysis={result.analysis} />

              <ResumeDiffView
                originalResume={resumeData}
                improvedResume={improvedResume}
                onApplyImproved={() => setModalMode("apply")}
                onSaveAsVersion={() => setModalMode("save-version")}
                disabled={isActionBusy}
              />
            </motion.div>
          ) : (
            <motion.div
              key="job-match-empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EmptyResultState />
            </motion.div>
          )}
        </AnimatePresence>

        <ApplyImprovementModal
          open={modalMode !== null}
          mode={modalMode}
          scoreDelta={scoreDelta}
          isApplying={isApplying}
          isSavingVersion={isSavingVersion}
          onClose={() => setModalMode(null)}
          onConfirmApply={() => {
            void handleApplyImproved()
          }}
          onConfirmSaveVersion={() => {
            void handleSaveAsVersion()
          }}
        />

        <Card className="border-[#d8e3ee] bg-white/85">
          <p className="text-xs text-[#607b96]">
            AI Job Match is a standalone workspace. You can still move the improved draft into Portfolio Builder when
            needed.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
            >
              Home
            </Link>
            <Link
              href="/upload"
              className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
            >
              Portfolio Builder
            </Link>
            <Link
              href="/edit"
              className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
            >
              Open Resume Editor
            </Link>
          </div>
        </Card>
      </div>
    </WizardShell>
  )
}
