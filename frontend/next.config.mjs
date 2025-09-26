/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const devTarget = process.env.NEXT_PUBLIC_COMPANY_DASHBOARD_URL
    if (devTarget) {
      return [
        {
          source: '/company-dashboard/:path*',
          destination: `${devTarget}/:path*`,
        },
      ]
    }
    return []
  },
}

export default nextConfig
