import Link from "next/link"
import { ArrowRight, Bot, BriefcaseBusiness, CheckCircle2, Sparkles, UploadCloud } from "lucide-react"

import { Card } from "@/components/ui/card"

const builderSteps = [
  "Upload resume PDF",
  "Edit structured profile",
  "Choose a template",
  "Preview live",
  "Deploy public URL"
]

const jobMatchCapabilities = [
  "Paste a job description",
  "Run n8n-based evaluation",
  "See original vs improved score",
  "Review improvement analysis",
  "Apply regenerated resume version"
]

const trustPoints = [
  "Portfolio Builder flow stays unchanged",
  "AI Job Match runs as a separate workspace",
  "Both features share the same design language"
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,#d7e8fb_0%,#eef5fd_45%,#f5f8fc_100%)]" />
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-10 md:px-10 lg:pt-14">
        <section className="max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#bdd2e7] bg-white/80 px-3 py-1 text-xs font-semibold text-[#295070]">
            <Sparkles className="h-3.5 w-3.5" />
            Two focused workflows, one calm interface
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight text-[#0e2239] md:text-6xl">
            Choose the workflow you need right now.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#47617c] md:text-lg">
            OneTapp includes two distinct features: an existing Portfolio Builder and a new AI Job Match & Resume
            Regenerator powered by n8n workflow automation.
          </p>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="border-[#c7d7e8] bg-white/95">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e1edf9] text-[#26527c]">
              <UploadCloud className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#10243e]">Portfolio Builder</h2>
            <p className="mt-1 text-sm text-[#54708b]">
              Existing guided flow for converting resumes into live portfolio pages.
            </p>
            <ol className="mt-4 space-y-2">
              {builderSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center justify-between rounded-lg border border-[#d9e4f0] bg-[#f8fbff] px-3 py-2 text-sm"
                >
                  <span className="text-[#304f6e]">{step}</span>
                  <span className="text-xs font-semibold text-[#6f849a]">{index + 1}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/upload"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0f4c81] px-5 text-sm font-semibold text-white transition hover:bg-[#0d406d]"
              >
                Open Portfolio Builder
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/templates"
                className="inline-flex h-11 items-center rounded-xl border border-[#c5d5e5] bg-white px-5 text-sm font-semibold text-[#193755] transition hover:bg-[#f3f8ff]"
              >
                Browse Templates
              </Link>
            </div>
          </Card>

          <Card className="border-[#c7d7e8] bg-white/95">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f0f8] text-[#224d75]">
              <Bot className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#10243e]">AI Job Match & Resume Regenerator</h2>
            <p className="mt-2 text-sm text-[#526c87]">
              New standalone feature that evaluates job fit and regenerates stronger resume content through n8n workflow.
            </p>
            <ul className="mt-4 space-y-2">
              {jobMatchCapabilities.map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between rounded-lg border border-[#d9e4f0] bg-[#f8fbff] px-3 py-2 text-sm"
                >
                  <span className="text-[#304f6e]">{item}</span>
                  <BriefcaseBusiness className="h-4 w-4 text-[#6f849a]" />
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/job-match"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0f4c81] px-5 text-sm font-semibold text-white transition hover:bg-[#0d406d]"
              >
                Open AI Job Match
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        </section>

        <section className="mt-8 flex flex-wrap gap-4 text-sm text-[#496580]">
          {trustPoints.map((point) => (
            <span key={point} className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1f7a57]" />
              {point}
            </span>
          ))}
        </section>
      </div>
    </main>
  )
}
