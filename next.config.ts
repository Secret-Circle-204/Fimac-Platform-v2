import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    minimumCacheTTL: 31536000, // cache optimised images for 1 year
    localPatterns: [
      {
        pathname: '/**',
        search: '',
      },
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8181',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fimac-group-mvge.vercel.app',
        port: '',
        pathname: '/**',
      },

      {
        protocol: 'https',
        hostname: 'fimac-group.vercel.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fimac-group-mvge-secret-circles-projects.vercel.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fimacgroup.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'fimacgroup.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Payload serves media via its own API route — disable Next.js optimizer
    // for those paths to avoid the self-referential 504 loop.
    // Pages that need sharp-optimized output should use a CDN URL instead.
    unoptimized: process.env.NODE_ENV === 'development',
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Prevent Webpack from trying to bundle native optional ws addons.
    // These are only used when running ws in a bare Node process; inside
    // Next.js the pure-JS fallback path is always correct.
    webpackConfig.externals = [
      ...(webpackConfig.externals ?? []),
      { bufferutil: 'commonjs bufferutil' },
      { 'utf-8-validate': 'commonjs utf-8-validate' },
    ]

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
