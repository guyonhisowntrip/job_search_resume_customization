import { usePortfolio } from "../portfolio-context"

export function ExperienceSection() {
  const portfolio = usePortfolio()
  return (
    <section id="experience" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Experience</p>
          <h2 className="mt-3 text-3xl font-semibold">Trusted to ship AI systems</h2>
          <p className="mt-2 text-muted-foreground">
            Roles focused on production ML, evaluation, and cross-functional delivery.
          </p>
        </div>

        <div className="relative mt-10">
          <div className="space-y-12">
            {portfolio.experience.map((item, index) => {
              const isLeft = index % 2 === 0
              return (
                <div key={item.id} className="relative grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-start">
                  <div className={isLeft ? "" : "md:order-3"} />
                  <div className="relative hidden md:flex md:order-2 md:h-full md:items-start md:justify-center">
                    <span className="mt-4 h-3 w-3 rounded-full bg-primary shadow-[0_0_0_6px_rgba(56,189,248,0.12)]" />
                    <span className="absolute top-6 h-[calc(100%_-_24px)] w-px bg-border/40" />
                  </div>
                  <article
                    className={`rounded-2xl border border-border bg-card/70 p-6 shadow-lg md:w-full ${
                      isLeft ? "md:order-1 md:ml-auto md:text-left" : "md:order-3 md:mr-auto md:text-left"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{item.role}</h3>
                        <p className="text-sm text-muted-foreground">{item.company}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.period}</span>
                    </div>
                    <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {item.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.stack.map((tool) => (
                        <span
                          key={tool}
                          className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </article>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
