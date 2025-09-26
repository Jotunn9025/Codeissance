import { PageShell } from "@/components/layout/page-shell"
import { AlertList } from "@/components/alert-list"

export default function AlertsPage() {
  return (
    <PageShell title="Alerts" subtitle="Proactive recommendations based on trend shifts.">
      <AlertList />
    </PageShell>
  )
}
