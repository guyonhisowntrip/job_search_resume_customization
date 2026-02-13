"use client"

import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import PortfolioRenderer from "@/components/portfolio/portfolio-renderer"
import { ResumeData } from "@/lib/resume-schema"

export function TemplateMiniPreview({ templateId, resumeData }: { templateId: string; resumeData: ResumeData }) {
  return (
    <div className="relative h-48 overflow-hidden rounded-xl border border-[#cad6e2] bg-[#f7fbff]">
      <Suspense fallback={<Skeleton className="h-full w-full" />}>
        <div className="pointer-events-none absolute left-1/2 top-0 h-[780px] w-[1280px] -translate-x-1/2 origin-top scale-[0.19]">
          <PortfolioRenderer templateId={templateId} resumeData={resumeData} />
        </div>
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f7fbff]" />
    </div>
  )
}
