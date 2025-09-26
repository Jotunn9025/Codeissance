"use client"

import type React from "react"

import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"

type PageShellProps = {
  title?: string
  subtitle?: string
  children: React.ReactNode
  className?: string
}

export function PageShell({ title, subtitle, children, className }: PageShellProps) {
  return (
    <div className="min-h-dvh flex bg-background text-foreground">
      <Sidebar />
      <main className={cn("flex-1 p-6 md:p-8", className)}>
        {title ? (
          <header className="mb-6">
            <h1 className="text-balance text-2xl md:text-3xl font-semibold">{title}</h1>
            {subtitle ? <p className="text-pretty text-muted-foreground mt-1">{subtitle}</p> : null}
          </header>
        ) : null}
        {children}
      </main>
    </div>
  )
}
