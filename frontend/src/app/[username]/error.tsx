"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function PublicPortfolioError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold text-[#10243e]">Portfolio Unavailable</h1>
      <p className="mt-2 text-sm text-[#58708a]">We could not load this portfolio right now.</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Retry</Button>
        <Link href="/" className="inline-flex h-10 items-center rounded-xl border border-[#cad2dd] px-4 text-sm font-semibold text-[#1b3a5a]">
          Home
        </Link>
      </div>
    </main>
  )
}
