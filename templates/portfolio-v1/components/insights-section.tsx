"use client"

import { useInsights } from "./insights-context"

export function InsightsSection() {
  const { mostAskedProject, mostAskedSkill } = useInsights()

  return (
    <section id="insights" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Recruiter Insights</p>
          <h2 className="mt-3 text-3xl font-semibold">What recruiters ask most</h2>
          <p className="mt-2 text-muted-foreground">
            Live, session-only signals that highlight the projects and skills drawing the most attention.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card/70 p-6">
            <p className="text-xs text-muted-foreground">Most asked project</p>
            <p className="mt-3 text-lg font-semibold">
              {mostAskedProject ?? "Waiting for first recruiter question"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Signals which project stories are resonating and should be emphasized in interviews.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-6">
            <p className="text-xs text-muted-foreground">Most asked skill</p>
            <p className="mt-3 text-lg font-semibold">{mostAskedSkill ?? "No skill focus yet"}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Highlights the skills recruiters want to validate quickly.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-6">
            <p className="text-xs text-muted-foreground">How to use this</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Ask the chatbot about architecture, datasets, outcomes, and trade-offs to surface the most relevant
              evidence. These insights reset every session and are stored only in your browser.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
