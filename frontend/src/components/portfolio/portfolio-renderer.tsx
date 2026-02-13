"use client"

import PortfolioTemplateV1 from "@templates/portfolio-v1/Template"

import { ResumeData } from "@/lib/resume-schema"

type PortfolioRendererProps = {
  templateId: string
  resumeData: ResumeData
}

export default function PortfolioRenderer({ templateId, resumeData }: PortfolioRendererProps) {
  switch (templateId) {
    case "portfolio-v1":
    default:
      return <PortfolioTemplateV1 resumeData={resumeData} />
  }
}
