"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FileUp, TriangleAlert, Upload, WandSparkles } from "lucide-react"

import { WizardShell } from "@/components/layout/wizard-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useWizard } from "@/context/wizard-context"
import { inferConfidenceMap } from "@/lib/confidence"
import { normalizeResumeData } from "@/lib/resume-schema"
import { parseUploadedResume, uploadResume } from "@/lib/api"

export default function UploadPage() {
  const router = useRouter()
  const { setResumeData } = useWizard()

  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")

  async function handleUpload() {
    if (!file || isUploading) {
      return
    }

    setError("")
    setIsUploading(true)

    try {
      setStatus("Uploading resume")
      const uploadResult = await uploadResume(file)

      setStatus("Parsing and structuring content")
      const parseResult = await parseUploadedResume(uploadResult.uploadId)
      const normalized = normalizeResumeData(parseResult.resumeData)

      setResumeData(normalized)

      const confidenceMap = inferConfidenceMap(normalized)
      const lowCount = Object.keys(confidenceMap).length
      if (lowCount > 0) {
        setStatus(`Parsed with ${lowCount} low-confidence fields to review`)
      } else {
        setStatus("Parsed successfully")
      }

      router.push("/edit")
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed")
      setStatus("")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <WizardShell
      title="Upload Your Resume"
      description="Drop a PDF and we will extract structured profile data. You can review every field before publishing."
      actions={
        <Link href="/edit" className="text-sm font-semibold text-[#2b557e] hover:text-[#16395b]">
          Skip and edit manually
        </Link>
      }
    >
      <Card className="max-w-3xl">
        <div className="rounded-2xl border border-dashed border-[#c3d4e5] bg-[#f8fbff] p-8">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e2eef9] text-[#28527c]">
              <FileUp className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-[#10243e]">Upload resume PDF</h2>
            <p className="mt-2 text-sm text-[#58708a]">Best results come from text-based PDFs with clear section headings.</p>

            <label className="mt-6 w-full cursor-pointer rounded-xl border border-[#cad7e4] bg-white px-4 py-5 text-left transition hover:border-[#87a6c8] hover:bg-[#fcfdff]">
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="sr-only"
              />

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#1d3a58]">{file ? file.name : "Choose PDF"}</p>
                  <p className="text-xs text-[#627b95]">Single PDF file, up to a few MB recommended.</p>
                </div>
                <Upload className="h-5 w-5 shrink-0 text-[#6c88a2]" />
              </div>
            </label>

            <div className="mt-5 flex w-full flex-wrap justify-center gap-3">
              <Button onClick={handleUpload} disabled={!file || isUploading}>
                <WandSparkles className="mr-1.5 h-4 w-4" />
                {isUploading ? "Processing..." : "Parse Resume"}
              </Button>
              <Link
                href="/templates"
                className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
              >
                Use Existing Draft
              </Link>
            </div>

            {status ? <Badge className="mt-4" tone="success">{status}</Badge> : null}
            {error ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#f0c1b5] bg-[#fff3ef] px-3 py-2 text-sm text-[#9c412f]">
                <TriangleAlert className="h-4 w-4" />
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </WizardShell>
  )
}
