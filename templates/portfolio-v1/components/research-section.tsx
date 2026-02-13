import { usePortfolio } from "../portfolio-context"

export function ResearchSection() {
  const portfolio = usePortfolio()
  return (
    <section id="research" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Research</p>
          <h2 className="mt-3 text-3xl font-semibold">Applied research with measurable outcomes</h2>
          <p className="mt-2 text-muted-foreground">Focused on reliability, evaluation, and healthcare AI.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {portfolio.research.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-card/70 p-6">
              <p className="text-xs text-muted-foreground">{item.area}</p>
              <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
              <span className="mt-4 inline-flex rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                {item.year}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
