import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all hostnames
      },
    ],
  },
  // Add this proxy configuration
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.NODE_ENV === 'production' 
          ? "https://routesyncai.onrender.com/:path*"  // Replace with your Render URL
          : "http://127.0.0.1:8000/:path*",
      },
    ]
  },
   env: {
    BACKEND_URL: process.env.BACKEND_URL || "http://127.0.0.1:8000",
  },
}

export default nextConfig

