"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Home, TrendingUp, AlertTriangle, Radio, Settings } from "lucide-react"

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/forecasts", label: "Forecasts", icon: TrendingUp },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/sources", label: "Sources", icon: Radio },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden md:flex w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      aria-label="Primary"
    >
      <div className="flex flex-col w-full h-dvh">
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 group">
            <div
              aria-hidden
              className="size-8 rounded-lg bg-sidebar-primary flex items-center justify-center shadow-sm"
              title="Brand"
            >
              <BarChart3 className="size-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <span className="text-lg font-semibold leading-none">Sentiment Oracle</span>
              <div className="text-xs text-muted-foreground mt-0.5">Market Intelligence</div>
            </div>
            <span className="sr-only">Go to home</span>
          </Link>
        </div>

        <nav className="flex-1 p-4" aria-label="Main">
          <ul className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-2 rounded-full bg-chart-2 animate-pulse" title="System Status" />
            <span className="text-xs font-medium text-sidebar-foreground">Live Data Stream</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>v0 demo interface</p>
            <p>All data is mocked</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
