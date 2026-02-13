import { usePortfolio } from "../portfolio-context"

export function AchievementsSection() {
  const portfolio = usePortfolio()
  return (
    <section id="achievements" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Achievements</p>
          <h2 className="mt-3 text-3xl font-semibold">Signals of impact</h2>
          <p className="mt-2 text-muted-foreground">Recognitions that highlight real-world results.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {portfolio.achievements.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-card/70 p-6">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
