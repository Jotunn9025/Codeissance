import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Dynamic Market Sentiment Forecaster
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Agentic AI that autonomously collects signals, forecasts sentiment trends, and turns them into proactive strategy.
          </p>
        </div>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold">Why this matters</h2>
          <p className="text-muted-foreground mt-2">
            Static sentiment snapshots miss evolving narratives. Our engine ingests multi-source data, models it as a
            time-series, detects turning points, and forecasts market impact.
          </p>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              View Live Dashboard
            </Link>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-0 overflow-hidden">
          <Image
            src={"/placeholder.svg?height=420&width=768&query=Sentiment%20Signals%20Dashboard%20preview"}
            alt="Preview of the sentiment dashboard interface"
            width={768}
            height={420}
            className="w-full h-auto"
            priority
          />
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          { t: "Agentic Collection", d: "Autonomous ingestion from news, social, and forums." },
          { t: "Time-Series Modeling", d: "Predictive signals with trend shifts and confidence." },
          { t: "Proactive Alerts", d: "Actionable recommendations tied to market impact." },
        ].map((f) => (
          <div key={f.t} className="rounded-lg border bg-card p-4">
            <h3 className="font-medium">{f.t}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.d}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
