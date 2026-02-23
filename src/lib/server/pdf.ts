export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Import internal implementation directly to avoid side effects in package root index.js.
  const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js")
  const pdfParse = pdfParseModule.default as (data: Buffer) => Promise<{ text?: string }>
  const result = await pdfParse(buffer)
  return (result.text ?? "").trim()
}
