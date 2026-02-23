"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Code2, Github } from "lucide-react"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { usePortfolio } from "../portfolio-context"

export function ActivitySection() {
  const portfolio = usePortfolio()
  const githubUsername = portfolio.activities.github
  const leetcodeUsername = portfolio.activities.leetcode
  const githubHeatmapLightUrl = `https://ghchart.rshah.org/0ea5e9/${githubUsername}`
  const githubHeatmapDarkUrl = `https://ghchart.rshah.org/22d3ee/${githubUsername}`
  const leetcodeHeatmapLightUrl = `https://leetcard.jacoblin.cool/${leetcodeUsername}?theme=light&font=Geist%20Mono&ext=heatmap`
  const leetcodeHeatmapDarkUrl = `https://leetcard.jacoblin.cool/${leetcodeUsername}?theme=dark&font=Geist%20Mono&ext=heatmap`
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="activity" className="py-24 md:py-32 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={cn(
            "text-center space-y-4 mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          <p className="text-primary font-mono text-sm tracking-wider">CONSISTENCY</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Daily Practice Radar</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A live snapshot of my everyday problem-solving streaks across GitHub and LeetCode.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:border-primary/50",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
            style={{ transitionDelay: isVisible ? "150ms" : "0ms" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-70" />
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-primary font-mono text-xs tracking-[0.2em]">GITHUB</p>
                  <h3 className="text-xl font-semibold text-foreground">Contribution Calendar</h3>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`https://github.com/${githubUsername}`} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    Profile
                  </Link>
                </Button>
              </div>

              <div className="rounded-xl border border-border/70 bg-gradient-to-br from-background/80 via-secondary/70 to-background/80 p-4">
                <div className="flex h-40 sm:h-44 lg:h-48 items-center justify-center">
                  <img
                    src={githubHeatmapLightUrl}
                    alt="GitHub contribution calendar"
                    className="h-full w-full object-contain dark:invert"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-primary/20" />
                  <span className="h-2 w-2 rounded-sm bg-primary/40" />
                  <span className="h-2 w-2 rounded-sm bg-primary/60" />
                  <span className="h-2 w-2 rounded-sm bg-primary/80" />
                </div>
                <span>More</span>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-500 hover:border-primary/50",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            )}
            style={{ transitionDelay: isVisible ? "300ms" : "0ms" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-70" />
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-primary font-mono text-xs tracking-[0.2em]">LEETCODE</p>
                  <h3 className="text-xl font-semibold text-foreground">Daily Grind Calendar</h3>
                </div>
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`https://leetcode.com/${leetcodeUsername}`} target="_blank" rel="noopener noreferrer">
                    <Code2 className="h-4 w-4" />
                    Profile
                  </Link>
                </Button>
              </div>

              <div className="rounded-xl border border-border/70 bg-gradient-to-br from-background/80 via-secondary/70 to-background/80 p-4">
                <div className="flex h-40 sm:h-44 lg:h-48 items-center justify-center">
                  <img
                    src={leetcodeHeatmapLightUrl}
                    alt="LeetCode activity calendar"
                    className="h-full w-full object-contain dark:hidden"
                    loading="lazy"
                  />
                  <img
                    src={leetcodeHeatmapDarkUrl}
                    alt="LeetCode activity calendar"
                    className="hidden h-full w-full object-contain dark:block"
                    loading="lazy"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Tracking daily problem-solving momentum and consistency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
