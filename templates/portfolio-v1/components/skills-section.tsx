"use client"

import { useMemo, useState, useEffect } from "react"
import { usePortfolio } from "../portfolio-context"

export function SkillsSection() {
  const portfolio = usePortfolio()
  const skills = portfolio.skills
  const projects = portfolio.projects
  const [activeSkill, setActiveSkill] = useState(skills[0])

  useEffect(() => {
    if (!activeSkill && skills.length > 0) {
      setActiveSkill(skills[0])
    }
  }, [skills, activeSkill])

  const relatedProjects = useMemo(() => {
    if (!activeSkill) return []
    return projects.filter((project) => activeSkill.projects.includes(project.id))
  }, [activeSkill, projects])

  if (!activeSkill) {
    return null
  }

  return (
    <section id="skills" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Skill Proof</p>
          <h2 className="mt-3 text-3xl font-semibold">Depth over buzzwords</h2>
          <p className="mt-2 text-muted-foreground">
            Click a skill to see evidence: projects, tools, and deployment depth.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[2fr_3fr]">
          <div className="space-y-3">
            {skills.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setActiveSkill(skill)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  activeSkill.id === skill.id
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-card/50 hover:border-primary/30"
                }`}
              >
                <p className="text-sm font-semibold">{skill.name}</p>
                <p className="text-xs text-muted-foreground">{skill.summary}</p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card/70 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{activeSkill.name}</h3>
                <p className="text-sm text-muted-foreground">{activeSkill.summary}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Evidence from {relatedProjects.length} projects
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Projects</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {relatedProjects.map((project) => (
                    <li key={project.id} className="rounded-lg border border-border px-3 py-2">
                      <p className="font-semibold">{project.title}</p>
                      <p className="text-xs text-muted-foreground">{project.impact}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Tools & Proof</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeSkill.tools.map((tool) => (
                    <span key={tool} className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                      {tool}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Depth indicator</p>
                  <p className="text-xs">
                    {relatedProjects.length} production projects, multi-stack integration, and evaluation artifacts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
