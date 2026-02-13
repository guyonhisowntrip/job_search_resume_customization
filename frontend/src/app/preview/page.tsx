"use client"

import Link from "next/link"
import { Suspense, lazy } from "react"
import { Eye, Rocket, TriangleAlert } from "lucide-react"

import { ResumeEditor } from "@/components/editor/resume-editor"
import { WizardShell } from "@/components/layout/wizard-shell"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useWizard } from "@/context/wizard-context"

const PortfolioRenderer = lazy(() => import("@/components/portfolio/portfolio-renderer"))

export default function PreviewPage() {
  const { resumeData, setResumeData, confidenceMap, selectedTemplate, validation } = useWizard()

  return (
    <WizardShell
      title="Live Portfolio Preview"
      description="Edit on the left and watch the public portfolio renderer update instantly on the right."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/job-match" className="text-sm font-semibold text-[#2b557e] hover:text-[#16395b]">
            Run Job Match
          </Link>
          <Link href="/deploy" className="text-sm font-semibold text-[#2b557e] hover:text-[#16395b]">
            Skip to Deploy
          </Link>
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Card className="max-h-[calc(100vh-10rem)] overflow-y-auto">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-[#10243e]">Quick Edit</h2>
            <div className="flex items-center gap-2 text-xs">
              {validation.missingPaths.length ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fff1eb] px-2.5 py-1 font-semibold text-[#9b4331]">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  {validation.missingPaths.length} required fields missing
                </span>
              ) : null}
              {Object.keys(confidenceMap).length ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fff8ed] px-2.5 py-1 font-semibold text-[#9e6d2f]">
                  <Eye className="h-3.5 w-3.5" />
                  {Object.keys(confidenceMap).length} low confidence
                </span>
              ) : null}
            </div>
          </div>

          <ResumeEditor compact data={resumeData} onChange={setResumeData} confidenceMap={confidenceMap} />

          <div className="mt-4 flex justify-end">
            <Link
              href="/job-match"
              className="inline-flex h-10 items-center rounded-xl bg-[#0f4c81] px-4 text-sm font-semibold text-white"
            >
              <Rocket className="mr-1.5 h-4 w-4" />
              Continue to Job Match
            </Link>
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-[#d7e1ec] bg-[#f7fbff] px-4 py-3 text-sm font-semibold text-[#234566]">
            Public renderer preview ({selectedTemplate})
          </div>
          <div className="h-[calc(100vh-12rem)] overflow-y-auto bg-white">
            <Suspense fallback={<Skeleton className="m-4 h-[720px]" />}>
              <PortfolioRenderer templateId={selectedTemplate} resumeData={resumeData} />
            </Suspense>
          </div>
        </Card>
      </div>
    </WizardShell>
  )
}
