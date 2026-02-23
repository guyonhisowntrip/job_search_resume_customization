"use client"

import Link from "next/link"
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react"

import { ResumeEditor } from "@/components/editor/resume-editor"
import { WizardShell } from "@/components/layout/wizard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWizard } from "@/context/wizard-context"

function formatSaveLabel(status: "idle" | "saving" | "saved" | "error", lastSavedAt: number | null) {
  if (status === "saving") return "Autosaving..."
  if (status === "error") return "Autosave failed"
  if (status === "saved" && lastSavedAt) {
    return `Saved at ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
  }
  return ""
}

const REQUIRED_FIELD_LABELS: Record<string, string> = {
  "personal.name": "Full name",
  "personal.title": "Professional title",
  "personal.summary": "Summary",
  "contact.email": "Email",
  "contact.location": "Location",
  skills: "At least one skill",
  "experience|projects": "At least one experience or one project"
}

function toMissingFieldLabel(path: string) {
  return REQUIRED_FIELD_LABELS[path] ?? path
}

export default function EditPage() {
  const { hydrated, resumeData, setResumeData, confidenceMap, validation, saveStatus, lastSavedAt } = useWizard()

  const lowConfidenceCount = Object.keys(confidenceMap).length
  const missingCount = validation.missingPaths.length
  const missingLabels = Array.from(new Set(validation.missingPaths.map(toMissingFieldLabel))).slice(0, 8)

  if (!hydrated) {
    return (
      <WizardShell
        title="Review Parsed Resume"
        description="Loading your latest draft..."
      >
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-[520px] w-full" />
        </div>
      </WizardShell>
    )
  }

  return (
    <WizardShell
      title="Review Parsed Resume"
      description="Edit each section inline. Changes autosave while you work and flow directly into template preview."
      actions={
        <div className="flex items-center gap-3">
          {saveStatus !== "idle" ? (
            <Badge tone={saveStatus === "error" ? "warning" : "success"}>{formatSaveLabel(saveStatus, lastSavedAt)}</Badge>
          ) : null}
          <Link href="/templates" className="text-sm font-semibold text-[#2b557e] hover:text-[#16395b]">
            Continue to Template
          </Link>
        </div>
      }
    >
      <div className="grid gap-4">
        {missingCount > 0 ? (
          <Card className="border-[#efc7ba] bg-[#fff4ef]">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-[#a94b34]" />
              <div>
                <h2 className="font-semibold text-[#8e3e2b]">Missing required data</h2>
                <p className="text-sm text-[#9c4b36]">
                  {missingCount} fields still need attention before deployment.
                </p>
                {missingLabels.length > 0 ? (
                  <ul className="mt-2 list-disc pl-5 text-sm text-[#9c4b36]">
                    {missingLabels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="border-[#cbe6da] bg-[#ecfbf3]">
            <div className="flex items-center gap-2 text-[#1f6a4b]">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-semibold">Required deployment fields are complete.</p>
            </div>
          </Card>
        )}

        {lowConfidenceCount > 0 ? (
          <Card className="border-[#f3d9b9] bg-[#fff8ef]">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 text-[#a0692e]" />
              <div>
                <h2 className="font-semibold text-[#8b5b25]">Low-confidence extraction detected</h2>
                <p className="text-sm text-[#9a6a31]">
                  {lowConfidenceCount} fields were extracted with weak confidence and are highlighted in amber.
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        <ResumeEditor
          data={resumeData}
          onChange={setResumeData}
          confidenceMap={confidenceMap}
          missingPaths={validation.missingPaths}
        />

        <div className="flex justify-end gap-3">
          <Link
            href="/templates"
            className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
          >
            Template Selection
          </Link>
          <Button asChild>
            <Link href="/preview">Open Live Preview</Link>
          </Button>
        </div>
      </div>
    </WizardShell>
  )
}
