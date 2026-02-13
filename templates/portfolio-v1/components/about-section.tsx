"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "../lib/utils"
import { usePortfolio } from "../portfolio-context"

export function AboutSection() {
  const portfolio = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const aboutPhoto =
    portfolio.profile.secondaryPhoto ||
    portfolio.profile.primaryPhoto

  return (
    <section ref={sectionRef} id="about" className="bg-[#f4f8fd] py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div
            className={cn(
              "relative transition-all duration-700",
              isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            )}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-[#58a9e8]/20 to-transparent blur-xl" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#d8e3ee] shadow-[0_24px_60px_rgba(14,34,58,0.12)]">
                {aboutPhoto ? (
                  <img src={aboutPhoto} alt={`${portfolio.profile.name} secondary profile`} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#e6eef8,#d2e2f2)] text-sm text-[#4d6883]">
                    Add a Secondary Photo in the editor
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className={cn(
              "space-y-6 transition-all duration-700 delay-200",
              isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            )}
          >
            <div className="space-y-2">
              <p className="font-mono text-sm tracking-wider text-[#2f5f88]">ABOUT</p>
              <h2 className="text-3xl font-bold text-[#10243e] md:text-4xl">{portfolio.profile.title}</h2>
            </div>

            <div className="space-y-4 leading-relaxed text-[#405f7e]">
              <p>{portfolio.profile.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              {portfolio.profile.stats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-3xl font-bold text-[#0f4c81]">{stat.value}</p>
                  <p className="text-sm text-[#5f7993]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
