import { Mail, MapPin, Phone } from "lucide-react"
import { usePortfolio } from "../portfolio-context"

export function ContactSection() {
  const portfolio = usePortfolio()
  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl border border-border bg-card/70 p-8">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Contact Me</p>
          <h2 className="mt-3 text-3xl font-semibold">Let's connect</h2>
          <p className="mt-2 text-muted-foreground">
            Have a project in mind or want to discuss opportunities? I’d love to hear from you.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            I’m open to ML engineering, data science, and AI research roles — and new collaborations.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <a
              className="flex items-center gap-2 rounded-full border border-border px-4 py-2 transition hover:border-primary/40"
              href={`mailto:${portfolio.profile.email}`}
            >
              <Mail className="h-4 w-4" />
              {portfolio.profile.email}
            </a>
            <span className="flex items-center gap-2 rounded-full border border-border px-4 py-2">
              <Phone className="h-4 w-4" />
              {portfolio.profile.phone}
            </span>
            <span className="flex items-center gap-2 rounded-full border border-border px-4 py-2">
              <MapPin className="h-4 w-4" />
              {portfolio.profile.location} (open to remote)
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
