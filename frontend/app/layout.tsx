import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import Navbar from "@/components/layout/navbar"

export const metadata: Metadata = {
  title: "Sentiment Oracle - Market Intelligence",
  description: "AI-powered sentiment forecasting and market analysis",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense>
          <Navbar />
          {children}
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
