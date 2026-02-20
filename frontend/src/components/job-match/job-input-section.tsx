"use client"

import { Loader2, Sparkles, TriangleAlert } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

const JOB_DESCRIPTION_PLACEHOLDER = `Senior Frontend Engineer
- Build and ship React + Next.js applications for enterprise customers
- Own performance, accessibility, and maintainable component architecture
- Collaborate with product and design on roadmap execution
- Experience with TypeScript, testing, and design systems required`

type JobInputSectionProps = {
  value: string
  onChange: (value: string) => void
  onEvaluate: () => void
  isEvaluating: boolean
  canEvaluate: boolean
  error?: string
  maxCharacters?: number
}

export function JobInputSection({
  value,
  onChange,
  onEvaluate,
  isEvaluating,
  canEvaluate,
  error,
  maxCharacters = 8000
}: JobInputSectionProps) {
  const characterCount = value.length

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#10243e]">Job Description</h2>
          <p className="mt-1 text-sm text-[#58708a]">
            Paste a full job post. The optimizer evaluates fit against your latest resume draft.
          </p>
        </div>
        <Badge tone="neutral">Current draft</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={JOB_DESCRIPTION_PLACEHOLDER}
          rows={12}
          maxLength={maxCharacters}
          className="text-[15px] leading-6"
          aria-label="Job description input"
          hasError={Boolean(error)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#68819a]">
            {characterCount}/{maxCharacters} characters
          </p>
          <Button onClick={onEvaluate} disabled={!canEvaluate}>
            {isEvaluating ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Evaluating
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-4 w-4" />
                Evaluate Job Match
              </>
            )}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 inline-flex items-start gap-2 rounded-xl border border-[#f0c2b6] bg-[#fff3ef] px-3 py-2 text-sm text-[#9a412f]">
          <TriangleAlert className="mt-0.5 h-4 w-4" />
          <p>{error}</p>
        </div>
      ) : null}
    </Card>
  )
}
