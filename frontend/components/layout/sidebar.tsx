"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BarChart3, Home, TrendingUp, AlertTriangle, Radio, Settings, Brain, Network, Target, TrendingDown, Lightbulb, GitBranch } from "lucide-react"

const nav = [
  { href: "/", label: "Home", icon: Home },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/topic-intelligence", label: "Topic Intelligence", icon: Brain },
  { href: "/market-insights", label: "Market Insights", icon: Target },
  { href: "/forecasts", label: "Forecasts", icon: TrendingUp },
  { href: "/alerts", label: "Alerts", icon: AlertTriangle },
  { href: "/sources", label: "Sources", icon: Radio },
  { href: "/settings", label: "Settings", icon: Settings },
]

const topicIntelligenceSubNav = [
  { href: "/topic-intelligence/clustering", label: "Topic Clustering", icon: GitBranch },
  { href: "/topic-intelligence/rising-alerts", label: "Rising Topics", icon: TrendingUp },
  { href: "/topic-intelligence/comention", label: "Co-mention Analysis", icon: Network },
]

const marketInsightsSubNav = [
  { href: "/market-insights/correlation", label: "Correlation Dashboard", icon: BarChart3 },
  { href: "/market-insights/forecasting", label: "Forecasting", icon: TrendingDown },
  { href: "/market-insights/strategy", label: "Strategy Suggestions", icon: Lightbulb },
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
              const active = pathname === item.href || 
                (item.href === "/topic-intelligence" && pathname.startsWith("/topic-intelligence")) ||
                (item.href === "/market-insights" && pathname.startsWith("/market-insights"))
              const Icon = item.icon
              const hasSubNav = item.href === "/topic-intelligence" || item.href === "/market-insights"
              const subNav = item.href === "/topic-intelligence" ? topicIntelligenceSubNav : 
                            item.href === "/market-insights" ? marketInsightsSubNav : []
              
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
                  
                  {/* Sub-navigation */}
                  {hasSubNav && active && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {subNav.map((subItem) => {
                        const subActive = pathname === subItem.href
                        const SubIcon = subItem.icon
                        return (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
                                subActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/60",
                              )}
                            >
                              <SubIcon className="size-3 shrink-0" />
                              {subItem.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="size-2 rounded-full bg-green-500 animate-pulse" title="System Status" />
            <span className="text-xs font-medium text-sidebar-foreground">Live Data Stream</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>v1.0 production</p>
            <p className="text-green-600 font-medium">Real-time data active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
