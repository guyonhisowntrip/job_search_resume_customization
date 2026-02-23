import { usePortfolio } from "../portfolio-context"

export function TechnicalSkillsSection() {
  const portfolio = usePortfolio()
  return (
    <section id="technical-skills" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Technical Skills</p>
          <h2 className="mt-3 text-3xl font-semibold">Core capabilities</h2>
          <p className="mt-2 text-muted-foreground">A compact overview of the stack behind the work.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {portfolio.skillGroups.map((group) => (
            <div key={group.title} className="rounded-2xl border border-border bg-card/70 p-6">
              <h3 className="text-lg font-semibold">{group.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
