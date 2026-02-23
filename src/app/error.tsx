"use client"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="rounded-2xl border border-[#f0c1b5] bg-[#fff4ef] p-8">
        <AlertTriangle className="mx-auto h-8 w-8 text-[#a94b34]" />
        <h1 className="mt-3 text-2xl font-semibold text-[#7f3727]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[#944431]">{error.message || "Unexpected error in the frontend."}</p>
        <div className="mt-5 flex justify-center">
          <Button onClick={reset}>Try Again</Button>
        </div>
      </div>
    </main>
  )
}
