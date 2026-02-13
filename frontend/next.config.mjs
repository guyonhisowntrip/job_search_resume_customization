import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    externalDir: true
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }]
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {}
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@templates": path.resolve(__dirname, "../templates")
    }

    const modules = config.resolve.modules ?? []
    config.resolve.modules = [path.resolve(__dirname, "node_modules"), ...modules]
    return config
  }
}

export default nextConfig
