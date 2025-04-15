/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["storage.googleapis.com"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Explicitly mark these Node.js modules as empty for client-side builds
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        http2: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        querystring: false,
        buffer: false,
        url: false,
        util: false,
        assert: false,
      }
    }

    // Exclude problematic dependencies from client-side bundles
    if (!isServer) {
      config.externals = [...(config.externals || []), "agent-base", "googleapis", "google-auth-library"]
    }

    return config
  },
  // Transpile specific problematic modules
  transpilePackages: ["agent-base", "googleapis", "google-auth-library"],
}

module.exports = nextConfig
