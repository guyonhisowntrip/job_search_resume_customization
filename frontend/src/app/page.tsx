import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles, UploadCloud } from "lucide-react"

import { Card } from "@/components/ui/card"

const platformSteps = [
  "Upload resume PDF",
  "Edit structured profile",
  "Choose a template",
  "Preview live",
  "Deploy public URL"
]

const trustPoints = [
  "No redesign needed for existing templates",
  "Live preview uses production renderer",
  "Server-rendered public portfolio pages"
]

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,#d7e8fb_0%,#eef5fd_45%,#f5f8fc_100%)]" />
      <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-12 pt-10 md:px-10 lg:grid-cols-[1.2fr_0.8fr] lg:pt-14">
        <section>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#bdd2e7] bg-white/80 px-3 py-1 text-xs font-semibold text-[#295070]">
            <Sparkles className="h-3.5 w-3.5" />
            Resume to portfolio, in one calm flow
          </span>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight text-[#0e2239] md:text-6xl">
            Build a professional portfolio from your resume without friction.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#47617c] md:text-lg">
            OneTapp converts your resume into a portfolio you can edit, preview, and publish in minutes.
            Designed for engineers and professionals who want speed with control.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/upload"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0f4c81] px-5 text-sm font-semibold text-white transition hover:bg-[#0d406d]"
            >
              Start Building
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/templates"
              className="inline-flex h-11 items-center rounded-xl border border-[#c5d5e5] bg-white px-5 text-sm font-semibold text-[#193755] transition hover:bg-[#f3f8ff]"
            >
              Browse Templates
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm text-[#496580]">
            {trustPoints.map((point) => (
              <span key={point} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1f7a57]" />
                {point}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <Card className="border-[#c7d7e8] bg-white/90">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e1edf9] text-[#26527c]">
              <UploadCloud className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-[#10243e]">Guided Wizard</h2>
            <p className="mt-1 text-sm text-[#54708b]">Every step is explicit, editable, and deployment-ready.</p>
            <ol className="mt-4 space-y-2">
              {platformSteps.map((step, index) => (
                <li
                  key={step}
                  className="flex items-center justify-between rounded-lg border border-[#d9e4f0] bg-[#f8fbff] px-3 py-2 text-sm"
                >
                  <span className="text-[#304f6e]">{step}</span>
                  <span className="text-xs font-semibold text-[#6f849a]">{index + 1}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="border-[#d7e3ef] bg-gradient-to-br from-white to-[#f2f7fc]">
            <h3 className="text-base font-semibold text-[#17314d]">Public Portfolio URL</h3>
            <p className="mt-2 text-sm text-[#526c87]">
              Publish to a clean route like
              <code className="ml-1 rounded bg-[#e6f0fa] px-1.5 py-0.5 text-[#284f73]">/{"{"}username{"}"}</code>
              with no admin UI leaked into the public experience.
            </p>
          </Card>
        </section>
      </div>
    </main>
  )
}
