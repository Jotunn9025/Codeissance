import { PageShell } from "@/components/layout/page-shell"

export default function CompanyDashboardPage() {
  // Serve the statically built Vite app copied to /public/company-dashboard
  const src = "/company-dashboard/index.html"
  return (
    <PageShell title="Company Dashboard" subtitle="Embedded market dashboard (bundled)">
      <div className="w-full h-[75vh] rounded-md border overflow-hidden">
        <iframe src={src} title="Company Dashboard" className="w-full h-full" />
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        This embedded build is bundled during `npm run build`. No separate terminal needed.
      </p>
    </PageShell>
  )
}


