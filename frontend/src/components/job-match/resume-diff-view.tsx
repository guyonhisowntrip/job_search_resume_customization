"use client"

import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/cn"
import { ResumeData } from "@/lib/resume-schema"

type FlatField = {
  path: string
  label: string
  value: string
}

function cleanText(value: string) {
  return value.trim()
}

function flattenResume(resume: ResumeData): FlatField[] {
  const fields: FlatField[] = []

  fields.push({ path: "personal.name", label: "Name", value: cleanText(resume.personal.name) })
  fields.push({ path: "personal.title", label: "Title", value: cleanText(resume.personal.title) })
  fields.push({ path: "personal.summary", label: "Summary", value: cleanText(resume.personal.summary) })
  fields.push({ path: "contact.email", label: "Email", value: cleanText(resume.contact.email) })
  fields.push({ path: "contact.phone", label: "Phone", value: cleanText(resume.contact.phone) })
  fields.push({ path: "contact.location", label: "Location", value: cleanText(resume.contact.location) })
  fields.push({ path: "links.linkedin", label: "LinkedIn", value: cleanText(resume.links.linkedin) })
  fields.push({ path: "links.github", label: "GitHub", value: cleanText(resume.links.github) })
  fields.push({ path: "links.portfolio", label: "Portfolio", value: cleanText(resume.links.portfolio) })

  resume.experience.forEach((item, index) => {
    const prefix = `Experience ${index + 1}`
    fields.push({ path: `experience.${index}.company`, label: `${prefix} Company`, value: cleanText(item.company) })
    fields.push({ path: `experience.${index}.role`, label: `${prefix} Role`, value: cleanText(item.role) })
    fields.push({
      path: `experience.${index}.duration`,
      label: `${prefix} Duration`,
      value: cleanText(`${item.startDate} - ${item.endDate}`)
    })
    fields.push({
      path: `experience.${index}.description`,
      label: `${prefix} Description`,
      value: cleanText(item.description)
    })
  })

  resume.projects.forEach((item, index) => {
    const prefix = `Project ${index + 1}`
    fields.push({ path: `projects.${index}.name`, label: `${prefix} Name`, value: cleanText(item.name) })
    fields.push({
      path: `projects.${index}.description`,
      label: `${prefix} Description`,
      value: cleanText(item.description)
    })
    fields.push({
      path: `projects.${index}.tech`,
      label: `${prefix} Tech`,
      value: item.tech.map(cleanText).filter(Boolean).join(", ")
    })
  })

  resume.skills.forEach((skill, index) => {
    fields.push({ path: `skills.${index}`, label: `Skill ${index + 1}`, value: cleanText(skill) })
  })

  resume.education.forEach((item, index) => {
    fields.push({ path: `education.${index}`, label: `Education ${index + 1}`, value: cleanText(item) })
  })

  return fields
}

type ResumeDiffViewProps = {
  originalResume: ResumeData
  improvedResume: ResumeData | null
  onApplyImproved: () => void
  onSaveAsVersion: () => void
  disabled?: boolean
}

export function ResumeDiffView({
  originalResume,
  improvedResume,
  onApplyImproved,
  onSaveAsVersion,
  disabled = false
}: ResumeDiffViewProps) {
  const rows = useMemo(() => {
    if (!improvedResume) return []

    const before = flattenResume(originalResume)
    const after = flattenResume(improvedResume)
    const beforeByPath = new Map(before.map((field) => [field.path, field]))
    const afterByPath = new Map(after.map((field) => [field.path, field]))
    const paths = new Set(before.map((field) => field.path))
    after.forEach((field) => paths.add(field.path))

    return Array.from(paths).map((path) => {
      const beforeField = beforeByPath.get(path)
      const afterField = afterByPath.get(path)
      const beforeValue = beforeField?.value ?? ""
      const afterValue = afterField?.value ?? ""

      return {
        key: path,
        label: afterField?.label ?? beforeField?.label ?? path,
        beforeValue,
        afterValue,
        changed: beforeValue !== afterValue
      }
    })
  }, [improvedResume, originalResume])

  const changedRows = rows.filter((row) => row.changed)

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#10243e]">Resume Improvement Diff</h2>
          <p className="mt-1 text-sm text-[#58708a]">Review key before/after changes before applying to your main draft.</p>
        </div>
        <p className="rounded-full bg-[#eef3f8] px-3 py-1 text-xs font-semibold text-[#486480]">
          {changedRows.length} changed fields
        </p>
      </div>

      {improvedResume ? (
        <>
          {changedRows.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#d7e1ec]">
              <div className="grid grid-cols-1 bg-[#f6f9fd] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#607a95] md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)]">
                <p>Field</p>
                <p>Before</p>
                <p>After</p>
              </div>
              <div className="max-h-[420px] overflow-y-auto divide-y divide-[#e6edf5]">
                {changedRows.map((row) => (
                  <div key={row.key} className="grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] md:gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#58708a]">{row.label}</p>
                    <p className="rounded-lg bg-[#f5f7fa] px-3 py-2 text-sm text-[#4d6580]">{row.beforeValue || "—"}</p>
                    <p
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        row.changed ? "bg-[#ebf8f0] text-[#245a3f]" : "bg-[#f5f7fa] text-[#4d6580]"
                      )}
                    >
                      {row.afterValue || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-[#c4d5e7] bg-[#f7fafe] px-4 py-6 text-sm text-[#637d97]">
              No text-level differences were detected between your current and improved resume.
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={onApplyImproved} disabled={disabled}>
              Apply Improvements to Resume
            </Button>
            <Button variant="secondary" onClick={onSaveAsVersion} disabled={disabled}>
              Save As New Version
            </Button>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-[#c4d5e7] bg-[#f7fafe] px-4 py-6 text-sm text-[#637d97]">
          Evaluate a job first to preview resume improvements and apply them safely.
        </div>
      )}
    </Card>
  )
}
