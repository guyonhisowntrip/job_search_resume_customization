"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "../lib/utils"
import { Award, ExternalLink } from "lucide-react"
import Link from "next/link"
import { usePortfolio } from "../portfolio-context"

export function CertificationsSection() {
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
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-32 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={cn(
            "text-center space-y-4 mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          <p className="text-primary font-mono text-sm tracking-wider">CREDENTIALS</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Courses & Certifications</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Continuous learning through prestigious institutions and platforms.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolio.certifications.map((cert, index) => (
            <Link
              key={cert.title}
              href={cert.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
              )}
              style={{ transitionDelay: isVisible ? `${index * 75}ms` : "0ms" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Award className="h-5 w-5" />
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {cert.title}
              </h3>
              <p className="text-sm text-primary font-medium mb-1">{cert.issuer}</p>
              <p className="text-xs text-muted-foreground">{cert.date}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
