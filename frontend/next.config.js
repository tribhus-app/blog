/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    // Otimização de imagens habilitada (WebP/AVIF automático)
    formats: ['image/avif', 'image/webp'],
    // Tamanhos otimizados para mobile-first
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Adicionado 512 para preencher lacuna entre 384 e 640 (comum em cards)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blog.tribhus.com.br',
      },
      {
        protocol: 'https',
        hostname: 'tribhus.com.br',
      },
      {
        protocol: 'https',
        hostname: '187.45.185.92',
        port: '9000',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'blog.tribhus.com',
      },
    ],
  },
  async headers() {
    return [
      // Cache agressivo para assets estáticos do Next.js
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache para imagens otimizadas pelo Next.js
      {
        source: '/_next/image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
          {
            key: 'Vary',
            value: 'Accept',
          },
        ],
      },
      // Headers de segurança para todas as rotas
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig