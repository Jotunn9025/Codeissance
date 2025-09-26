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
import { Menu, ChevronDown } from "lucide-react"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const baseLink = "text-sm transition-colors hover:text-primary text-foreground/80"
  const activeLink = "text-sm transition-colors text-primary"

  const isActive = (href: string) => pathname === href || pathname.startsWith(href)

  const NavLinks = () => (
    <ul className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
      <li>
        <Link href="/market-time-series" className={isActive("/market-time-series") ? activeLink : baseLink}>
          Market Time Series
        </Link>
      </li>
      <li className="md:block">
        <Link href="/forecasting" className={isActive("/forecasting") ? activeLink : baseLink}>
          Market Forecasting
        </Link>
      </li>
      <li className="md:block">
        <Link href="/what-if" className={isActive("/what-if") ? activeLink : baseLink}>
          What‑if Simulation
        </Link>
      </li>
      <li>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1 text-sm text-foreground/80 hover:text-primary transition-colors">
            Features <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <DropdownMenuLabel>Advanced Features</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/features/velocity-map" className="w-full">
                Cross‑Platform “Velocity” Map
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/features/campaign-strategist" className="w-full">
                Autonomous Campaign Strategist
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/features/narrative-tracker" className="w-full">
                Narrative Tracker Agent
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/features/early-warning" className="w-full">
                Sentiment Shift Early Warning
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Contact</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <a href="tel:+10000000000" className="w-full">
                Call
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="https://wa.me/10000000000" target="_blank" rel="noopener noreferrer" className="w-full">
                WhatsApp
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </li>
    </ul>
  )

  return (
    <header className="sticky top-0 z-40 w-full border-b border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 md:px-6"
        aria-label="Primary"
      >
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold text-base text-foreground hover:text-primary transition-colors">
            Sentiment Oracle
          </Link>
        </div>

        {/* Center: Desktop Nav */}
        <div className="hidden md:block">
          <NavLinks />
        </div>

        {/* Right: Auth */}
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm" className="text-foreground/90">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-96">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6">
                <NavLinks />
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild className="flex-1" onClick={() => setOpen(false)}>
                    <Link href="/signup">Sign up</Link>
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
