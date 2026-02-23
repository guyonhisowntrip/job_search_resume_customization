"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "../lib/utils"
import { BarChart3, Brain, Cpu, Database, Users, Rocket } from "lucide-react"
import { usePortfolio } from "../portfolio-context"

const iconMap = [Brain, BarChart3, Cpu, Database, Users, Rocket]

export function ServicesSection() {
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
    <section ref={sectionRef} className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={cn(
            "text-center space-y-4 mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
          )}
        >
          <p className="text-primary font-mono text-sm tracking-wider">EXPERTISE</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive AI and ML services tailored to solve real-world problems with production-ready solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.services.map((service, index) => {
            const Icon = iconMap[index % iconMap.length]
            return (
            <div
              key={service.title}
              className={cn(
                "group relative p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-500 overflow-hidden",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
              )}
              style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            </div>
          )})}
        </div>
      </div>
    </section>
  )
}
