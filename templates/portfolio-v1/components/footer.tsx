"use client"

import { useEffect, useState } from "react"

const QUOTES = [
  "Excellence beats speculation.",
  "Evaluate twice, deploy once.",
  "Trust is a model metric.",
  "RAG is only as good as its retrieval.",
  "Build systems people can rely on.",
  "\"The only way to do great work is to love what you do.\" — Steve Jobs",
]

export function Footer() {
  const [quote, setQuote] = useState(QUOTES[0])

  useEffect(() => {
    const pick = QUOTES[Math.floor(Math.random() * QUOTES.length)]
    setQuote(pick)
  }, [])

  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-center text-sm text-muted-foreground">
        <p className="text-xs uppercase tracking-[0.3em]">apst.me</p>
        <p className="text-foreground">{quote}</p>
        <p>© 2026 Aditya Pratap Singh Tomar. All rights reserved.</p>
      </div>
    </footer>
  )
}
