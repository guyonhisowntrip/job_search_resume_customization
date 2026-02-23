"use client"

import Link from "next/link"
import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function JobMatchError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="w-full rounded-2xl border border-[#f0c1b5] bg-[#fff4ef] p-8">
        <TriangleAlert className="mx-auto h-7 w-7 text-[#a94b34]" />
        <h1 className="mt-3 text-2xl font-semibold text-[#7f3727]">Job Match temporarily unavailable</h1>
        <p className="mt-2 text-sm text-[#944431]">
          {error.message || "The AI optimizer hit an unexpected issue."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={reset}>Retry</Button>
          <Link
            href="/edit"
            className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]"
          >
            Back to Editor
          </Link>
        </div>
      </div>
    </main>
  )
}

