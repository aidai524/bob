/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['uzpjieqzirlugyjmrywr.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 