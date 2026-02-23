import { NextResponse } from "next/server"

import { extractTextFromPdf } from "@/lib/server/pdf"
import { createUploadId } from "@/lib/server/upload-token"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ detail: "File is required." }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ detail: "Only PDF files are supported." }, { status: 400 })
    }

    const bytes = Buffer.from(await file.arrayBuffer())
    const text = await extractTextFromPdf(bytes)

    if (!text) {
      return NextResponse.json({ detail: "Could not extract text from PDF." }, { status: 400 })
    }

    const uploadId = createUploadId(text)
    return NextResponse.json({ uploadId })
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Failed to process upload."
    return NextResponse.json({ detail }, { status: 500 })
  }
}
