"use client"

import { ArrowUpRight } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/cn"

import { ScoreMeter } from "./score-meter"

function toneClasses(score: number) {
  if (score < 50) {
    return "border-[#f1c0b4] bg-[#fff4f1]"
  }
  if (score <= 75) {
    return "border-[#f0dbb3] bg-[#fffaf0]"
  }
  return "border-[#c6e6d4] bg-[#f2fbf6]"
}

type ScoreCardProps = {
  title: string
  score: number
  previousScore?: number
}

export function ScoreCard({ title, score, previousScore }: ScoreCardProps) {
  const delta = typeof previousScore === "number" ? Math.round(score - previousScore) : null

  return (
    <Card className={cn("space-y-3", toneClasses(score))}>
      <ScoreMeter label={title} score={score} />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#5b7591]">Score</p>
          <p className="text-3xl font-semibold text-[#163a5c]">{Math.round(score)}</p>
        </div>
        {delta !== null ? (
          <div
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
              delta > 0 ? "bg-[#e5f4eb] text-[#2d6e4c]" : "bg-[#eef3f8] text-[#506a84]"
            )}
          >
            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            {delta > 0 ? "+" : ""}
            {delta} pts
          </div>
        ) : null}
      </div>
    </Card>
  )
}

