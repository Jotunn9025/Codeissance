"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/swr"
import type { SourceConnector } from "@/lib/types"
import { PageShell } from "@/components/layout/page-shell"

export default function SourcesPage() {
  const { data, error, isLoading } = useSWR<SourceConnector[]>("/api/sources", fetcher, {
    revalidateOnFocus: false,
  })

  return (
    <PageShell title="Sources" subtitle="Data connectors for social, news, and forums.">
      {error && <div className="text-destructive">Failed to load sources.</div>}
      {(isLoading || !data) && <div className="text-muted-foreground">Loading sources…</div>}
      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((s) => (
            <div key={s.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{s.name}</h3>
                <span
                  className={
                    s.status === "error"
                      ? "text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground"
                      : s.status === "syncing"
                        ? "text-xs px-2 py-1 rounded bg-primary text-primary-foreground"
                        : "text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground"
                  }
                >
                  {s.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Last sync: <time dateTime={s.lastSync}>{new Date(s.lastSync).toLocaleString()}</time>
              </p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  )
}
