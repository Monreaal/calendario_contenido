/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // sql.js needs to be bundled only on the server
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
  // Exclude sql.js from client bundle
  serverExternalPackages: ['sql.js'],
}
module.exports = nextConfig
