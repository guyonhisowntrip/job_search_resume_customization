"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react"
import { Button } from "./ui/button"
import { usePortfolio } from "../portfolio-context"

export function HeroSection() {
  const portfolio = usePortfolio()
  const terminalLines = useMemo(
    () => [
      "$ whoami",
      portfolio.profile.name,
      `> ${portfolio.profile.title}`,
      "$ focus --current",
      portfolio.profile.headline
    ],
    [portfolio.profile.name, portfolio.profile.title, portfolio.profile.headline]
  )
  const [typed, setTyped] = useState("")
  const [lineIndex, setLineIndex] = useState(0)
  const [visitCount, setVisitCount] = useState(0)

  useEffect(() => {
    if (lineIndex >= terminalLines.length) return
    const currentLine = terminalLines[lineIndex]
    let charIndex = 0

    const interval = window.setInterval(() => {
      charIndex += 1
      setTyped((prev) => prev + currentLine[charIndex - 1])
      if (charIndex >= currentLine.length) {
        window.clearInterval(interval)
        setTyped((prev) => prev + "\n")
        setLineIndex((prev) => prev + 1)
      }
    }, 20)

    return () => window.clearInterval(interval)
  }, [lineIndex, terminalLines])

  useEffect(() => {
    if (typeof window === "undefined") return
    const key = "portfolio:visit-count"
    const raw = window.localStorage.getItem(key)
    const current = raw ? Number.parseInt(raw, 10) || 0 : 0
    const next = current + 1
    window.localStorage.setItem(key, String(next))
    setVisitCount(next)
  }, [])

  const heroPhoto =
    portfolio.profile.primaryPhoto ||
    portfolio.profile.photo

  return (
    <section id="hero" className="relative overflow-hidden pb-24 pt-24 md:pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(88,169,232,0.35),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,#0f1d35_0%,#1b2c4f_44%,#2d3f65_100%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#b0c3da]">AI-Native Portfolio</p>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">{portfolio.profile.name}</h1>
          <p className="max-w-2xl text-lg text-[#d0dcee]">{portfolio.profile.headline}</p>
          <p className="text-sm text-[#afc2da]">{portfolio.profile.title}</p>
          <p data-story="dominant-text" className="text-sm font-semibold text-[#8fd0ff]">
            Dominant in delivery. Precise in execution. Reliable in production.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="h-11 rounded-lg bg-white text-[#10243e] hover:bg-[#edf4ff]">
              <Link href="#projects">
                View Flagship Work
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-11 rounded-lg border-[#7ea3c9] bg-transparent text-white hover:bg-[#3a5376]">
              <a href={`mailto:${portfolio.profile.email}`}>
                <Mail className="mr-2 h-4 w-4" />
                Contact
              </a>
            </Button>
            <Button variant="secondary" asChild className="h-11 rounded-lg bg-[#6f89ad] text-white hover:bg-[#5d7da3]">
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
                View Resume
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-[#bdd1e7]">
            {portfolio.profile.socials.linkedin ? (
              <Link href={portfolio.profile.socials.linkedin} target="_blank" className="transition hover:text-white">
                <Linkedin className="h-5 w-5" />
              </Link>
            ) : null}
            {portfolio.profile.socials.github ? (
              <Link href={portfolio.profile.socials.github} target="_blank" className="transition hover:text-white">
                <Github className="h-5 w-5" />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="space-y-6">
          <div
            data-story="hero-photo"
            className="overflow-hidden rounded-2xl border border-[#6f89ad] bg-[#1f3154]/80 shadow-[0_24px_50px_rgba(7,16,32,0.55)]"
          >
            {heroPhoto ? (
              <img src={heroPhoto} alt={portfolio.profile.name} className="h-80 w-full object-cover" />
            ) : (
              <div className="flex h-80 w-full items-center justify-center bg-[linear-gradient(145deg,#1f3154,#2c4368)] text-sm text-[#c2d5eb]">
                Add a Primary Photo in the editor
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-10 max-w-6xl px-6">
        <div className="rounded-2xl border border-[#5e7898] bg-[#0c1628]/88 p-6 font-mono text-sm text-[#95ffd0] shadow-2xl">
          <div className="mb-3 flex items-center gap-2 text-xs text-[#8ea8c4]">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Terminal
          </div>
          <pre className="min-h-[180px] whitespace-pre-wrap">{typed}</pre>
          <span className="animate-pulse">▌</span>
          <div className="mt-4 flex items-center justify-between text-[11px] text-[#85a4c4]">
            <span></span>
            <span className="rounded-full border border-[#4e6f93] px-2 py-0.5 text-[#9ed5ff]">profile visits: {visitCount}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
