"use client"

import { useState } from "react"
import { Copy, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

export function ResumeTailorSection() {
  const [jobDescription, setJobDescription] = useState("")
  const [output, setOutput] = useState("")
  const [loading, setLoading] = useState(false)

  const generateResume = async () => {
    if (!jobDescription.trim()) return
    setLoading(true)
    try {
      const response = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      })
      const data = (await response.json()) as { response?: string; error?: string }
      const raw = data.response ?? data.error ?? "No response generated."
      setOutput(stripMarkdown(raw))
    } catch {
      setOutput("Unable to reach the AI service.")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output)
  }

  return (
    <section id="resume" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Role Fit Check</p>
            <h2 className="mt-3 text-3xl font-semibold">Check role suitability in seconds</h2>
            <p className="mt-2 text-muted-foreground">
              Paste a job description and get a recruiter-ready fit summary, matched skills, and relevant projects.
            </p>
          </div>
          <Button onClick={generateResume} disabled={loading || !jobDescription.trim()}>
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Analyzing..." : "Check Role Suitability"}
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/70 p-6">
            <h3 className="text-sm font-semibold">Job Description</h3>
            <Textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job description here..."
              className="mt-3 min-h-[240px]"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Tailored Output</h3>
              <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!output.trim()}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
            <pre className="mt-3 max-h-[320px] whitespace-pre-wrap text-sm text-muted-foreground">
              {output || "Tailored summary will appear here."}
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

function stripMarkdown(text: string) {
  return text
    .replace(/```[\\s\\S]*?```/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\\*\\*(.*?)\\*\\*/g, "$1")
    .replace(/\\*(.*?)\\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/^#{1,6}\\s+/gm, "")
    .replace(/^>\\s?/gm, "")
    .replace(/\\[(.*?)\\]\\((.*?)\\)/g, "$1")
    .trim()
}
