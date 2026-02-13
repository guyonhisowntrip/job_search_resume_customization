"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Rocket, TriangleAlert } from "lucide-react"
import { useMemo, useState } from "react"

import { WizardShell } from "@/components/layout/wizard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useWizard } from "@/context/wizard-context"
import { deployPortfolio } from "@/lib/api"

function sanitizeUsername(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
}

export default function DeployPage() {
  const router = useRouter()
  const { resumeData, selectedTemplate, username, setUsername, validation } = useWizard()

  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [isDeploying, setIsDeploying] = useState(false)

  const isUsernameValid = useMemo(() => /^[a-z0-9-]{3,30}$/.test(username), [username])
  const canDeploy = validation.isValid && isUsernameValid && !isDeploying

  async function handleDeploy() {
    if (!canDeploy) {
      return
    }

    setError("")
    setStatus("Deploying portfolio")
    setIsDeploying(true)

    try {
      const result = await deployPortfolio({
        username,
        template: selectedTemplate,
        resumeData
      })

      setStatus("Deployment complete")
      const encodedUrl = encodeURIComponent(result.url)
      router.push(`/deploy/success?url=${encodedUrl}&username=${encodeURIComponent(username)}`)
    } catch (deployError) {
      setError(deployError instanceof Error ? deployError.message : "Deploy failed")
      setStatus("")
      setIsDeploying(false)
    }
  }

  return (
    <WizardShell
      title="Deploy Portfolio"
      description="Choose a public username and publish your portfolio. The deployed page is clean and SEO-friendly."
      actions={
        <Link href="/job-match" className="text-sm font-semibold text-[#2b557e] hover:text-[#16395b]">
          Back to Job Match
        </Link>
      }
    >
      <div className="grid max-w-3xl gap-4">
        {!validation.isValid ? (
          <Card className="border-[#efc7ba] bg-[#fff4ef]">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 h-5 w-5 text-[#a94b34]" />
              <div>
                <h2 className="font-semibold text-[#8e3e2b]">Cannot deploy yet</h2>
                <p className="text-sm text-[#9c4b36]">
                  Complete {validation.missingPaths.length} required fields in the edit step before deployment.
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        <Card>
          <h2 className="text-lg font-semibold text-[#10243e]">Username</h2>
          <p className="mt-1 text-sm text-[#58708a]">Use lowercase letters, numbers, or hyphens. 3 to 30 characters.</p>

          <div className="mt-4 grid gap-2">
            <label htmlFor="username" className="text-xs font-semibold uppercase tracking-wide text-[#4d657f]">
              Public URL slug
            </label>
            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(sanitizeUsername(event.target.value))}
              placeholder="yourname"
              hasError={Boolean(username) && !isUsernameValid}
            />
            <p className="text-xs text-[#6d8399]">Portfolio URL: /{username || "yourname"}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">Template: {selectedTemplate}</Badge>
            {isUsernameValid ? <Badge tone="success">Username looks good</Badge> : null}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={handleDeploy} disabled={!canDeploy}>
              <Rocket className="mr-1.5 h-4 w-4" />
              {isDeploying ? "Deploying..." : "Deploy Portfolio"}
            </Button>
            <Link
              href="/edit"
              className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
            >
              Edit Resume Data
            </Link>
          </div>

          {status ? <p className="mt-3 text-sm text-[#365a7f]">{status}</p> : null}
          {error ? <p className="mt-3 text-sm text-[#a0412e]">{error}</p> : null}
        </Card>
      </div>
    </WizardShell>
  )
}
