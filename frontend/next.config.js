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
  async redirects() {
    return [
      {
        // O mesmo artigo existia em dois enderecos, os dois pedindo canonical para si
        // mesmos. O slug abaixo carrega no proprio endereco o resto de uma entidade
        // HTML escapada duas vezes ("and8220" = &#8220;), heranca da migracao do
        // WordPress. O post duplicado virou rascunho em 21/08/2026 — este 301 preserva
        // quem chegar pelo link velho.
        source: '/conheca-a-and8220revolucaoand8221-sonora-do-musico-samyr-rathge',
        destination: '/conheca-a-revolucao-sonora-do-musico-samyr-rathge',
        permanent: true,
      },
    ]
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
          // Adicionados em 21/08/2026 (auditoria de SEO). CSP ficou de fora de
          // proposito: a pagina carrega embed de YouTube e Google Tag Manager, entao
          // precisa entrar primeiro em modo report-only para nao quebrar o blog.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig