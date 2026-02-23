"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Copy, ExternalLink } from "lucide-react"
import { useState } from "react"

import { WizardShell } from "@/components/layout/wizard-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function DeploySuccessPage() {
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)

  const deployedUrl = searchParams.get("url") ? decodeURIComponent(searchParams.get("url") as string) : ""
  const username = searchParams.get("username") ?? ""

  async function handleCopy() {
    if (!deployedUrl) {
      return
    }

    try {
      await navigator.clipboard.writeText(deployedUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <WizardShell
      title="Deployment Complete"
      description="Your public portfolio is live. Share it in applications, social profiles, and recruiter outreach."
    >
      <Card className="max-w-3xl border-[#cde6d9] bg-[#f3fff8]">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 text-[#1f6a4b]" />
          <div>
            <h2 className="text-xl font-semibold text-[#1f5f46]">Portfolio deployed successfully</h2>
            <p className="mt-1 text-sm text-[#2f6e54]">{deployedUrl || "Deployment URL unavailable in this session."}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={handleCopy} disabled={!deployedUrl}>
            <Copy className="mr-1.5 h-4 w-4" />
            {copied ? "Copied" : "Copy URL"}
          </Button>
          <a
            href={deployedUrl || `/${username}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center rounded-xl bg-[#0f4c81] px-4 text-sm font-semibold text-white"
          >
            <ExternalLink className="mr-1.5 h-4 w-4" />
            Open Public Page
          </a>
          <Link
            href="/upload"
            className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
          >
            Start New Portfolio
          </Link>
        </div>
      </Card>
    </WizardShell>
  )
}
