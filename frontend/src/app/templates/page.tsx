"use client"

import Link from "next/link"
import { CheckCircle2, LayoutTemplate, Sparkles } from "lucide-react"

import { WizardShell } from "@/components/layout/wizard-shell"
import { TemplateMiniPreview } from "@/components/portfolio/template-mini-preview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWizard } from "@/context/wizard-context"
import { TEMPLATE_LIST, TEMPLATE_PREVIEW_SAMPLE } from "@/lib/templates"

export default function TemplatesPage() {
  const { selectedTemplate, setSelectedTemplate, resumeData } = useWizard()

  return (
    <WizardShell
      title="Choose Portfolio Template"
      description="Template choice updates your live preview instantly. More templates can be added without changing page logic."
      actions={
        <Link href="/preview" className="text-sm font-semibold text-[#2b557e] hover:text-[#16395b]">
          Skip to Preview
        </Link>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {TEMPLATE_LIST.map((template) => {
          const isSelected = selectedTemplate === template.id

          return (
            <Card
              key={template.id}
              className={
                isSelected
                  ? "border-[#74a0cc] bg-[linear-gradient(180deg,#fbfdff_0,#f3f8ff_100%)]"
                  : "border-[#d7e1ec]"
              }
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#10243e]">{template.name}</h2>
                  <p className="text-sm text-[#58708a]">{template.description}</p>
                </div>
                {isSelected ? <Badge tone="success">Selected</Badge> : null}
              </div>

              <div className="mb-4">
                <TemplateMiniPreview
                  templateId={template.id}
                  resumeData={resumeData.personal.name ? resumeData : TEMPLATE_PREVIEW_SAMPLE}
                />
              </div>

              <div className="rounded-xl border border-[#d8e3ee] bg-white/80 p-3 text-sm text-[#4e6782]">
                <p className="font-semibold text-[#1f3f60]">{template.previewTitle}</p>
                <p className="mt-1">{template.previewSubtitle}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant={isSelected ? "secondary" : "primary"}
                  onClick={() => setSelectedTemplate(template.id)}
                  disabled={!template.isAvailable}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Selected
                    </>
                  ) : (
                    <>
                      <LayoutTemplate className="mr-1.5 h-4 w-4" />
                      Select Template
                    </>
                  )}
                </Button>
                <Link
                  href="/preview"
                  className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
                >
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Preview Now
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </WizardShell>
  )
}
