"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,  
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, ChevronDown, TrendingUp } from "lucide-react"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const baseLink = "text-sm font-medium transition-all duration-200 hover:text-primary text-foreground/70 hover:scale-105 relative group"
  const activeLink = "text-sm font-medium text-primary relative group"

  const isActive = (href: string) => pathname === href || pathname.startsWith(href)

  const NavLinks = () => (
    <ul className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
      <li>
        <Link href="/" className={isActive("/") ? activeLink : baseLink}>
          Home
          <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${
            isActive("/") ? 'w-full' : 'w-0 group-hover:w-full'
          }`}></span>
        </Link>
      </li>
      <li>
        <Link href="/market-insights" className={isActive("/market-insights") ? activeLink : baseLink}>
          Market Insights
          <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${
            isActive("/market-insights") ? 'w-full' : 'w-0 group-hover:w-full'
          }`}></span>
        </Link>
      </li>
      <li>
        <Link href="/topic-intelligence" className={isActive("/topic-intelligence") ? activeLink : baseLink}>
          Topic Intelligence
          <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${
            isActive("/topic-intelligence") ? 'w-full' : 'w-0 group-hover:w-full'
          }`}></span>
        </Link>
      </li>
      <li>
        <Link href="/what-if" className={isActive("/what-if") ? activeLink : baseLink}>
          What-If
          <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${
            isActive("/what-if") ? 'w-full' : 'w-0 group-hover:w-full'
          }`}></span>
        </Link>
      </li>
      <li>
        <Link href="/alerts" className={isActive("/alerts") ? activeLink : baseLink}>
          Alerts
          <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-200 ${
            isActive("/alerts") ? 'w-full' : 'w-0 group-hover:w-full'
          }`}></span>
        </Link>
      </li>
      <li>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-2 text-sm font-medium text-foreground/70 hover:text-primary transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md px-2 py-1">
            Features 
            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-60 rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm shadow-xl animate-in fade-in-0 zoom-in-95 duration-200"
          >
            <DropdownMenuLabel className="px-4 py-3 text-xs font-semibold text-foreground/60 tracking-wider uppercase border-b border-border/30">
              Features
            </DropdownMenuLabel>

            <div className="p-2 space-y-1">
              <DropdownMenuItem asChild className="hover:bg-accent/80 rounded-lg px-4 py-3 transition-all duration-150 cursor-pointer group">
                <Link href="/forecasts" className="w-full flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 group-hover:bg-primary transition-colors"></div>
                  <div>
                    <div className="font-medium text-foreground">Forecast</div>
                    <div className="text-xs text-foreground/60 mt-1">Market forecasting</div>
                  </div>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="hover:bg-accent/80 rounded-lg px-4 py-3 transition-all duration-150 cursor-pointer group">
                <Link href="/market-time-series" className="w-full flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 group-hover:bg-primary transition-colors"></div>
                  <div>
                    <div className="font-medium text-foreground">Market Time Series</div>
                    <div className="text-xs text-foreground/60 mt-1">Time series analysis</div>
                  </div>
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    </ul>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-200">
      <nav
        className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 md:px-8"
        aria-label="Primary navigation"
      >
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center gap-2 font-bold text-xl text-foreground hover:text-primary transition-all duration-200 hover:scale-105 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-200">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Sentiment Oracle
            </span>
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="hidden lg:block">
          <NavLinks />
        </div>

        {/* Right: Dashboard */}
        <div className="hidden items-center gap-3 lg:flex">
          <Button 
            asChild 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-200 hover:scale-105"
          >
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-accent/50 transition-all duration-200 hover:scale-105"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[85vw] sm:w-96 bg-background/95 backdrop-blur-sm border-border/50"
            >
              <SheetHeader className="border-b border-border/30 pb-4">
                <SheetTitle className="text-left flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <TrendingUp className="h-3 w-3 text-primary-foreground" />
                  </div>
                  Navigation
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-8">
                <NavLinks />
                <div className="flex flex-col gap-3 pt-6 border-t border-border/30">
                  <Button 
                    asChild 
                    className="justify-center bg-primary hover:bg-primary/90 font-medium shadow-lg" 
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}