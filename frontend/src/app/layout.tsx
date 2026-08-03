import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/layout/LayoutWrapper'

const inter = Inter({ subsets: ['latin'] })

// GA4 — MESMA propriedade do tribhus.com.br (224591904), de propósito: é o que deixa
// visível a jornada blog -> site (post lido -> cadastro). Duas propriedades separadas
// dariam dois relatórios que nunca se cruzam, e o blog nunca receberia o crédito.
// Exige medição entre domínios ligada no GA4 (Admin -> Fluxos de dados -> Configurar
// domínios), senão quem vai do blog pro site conta como visitante novo.
const GA4_ID = 'G-5MXSFYGFSF'

export const metadata: Metadata = {
  metadataBase: new URL('https://blog.tribhus.com.br'),
  title: {
    default: 'Tribhus Blog | Rock Underground e Independente',
    template: '%s | Tribhus Blog',
  },
  description: 'O melhor conteudo sobre rock underground e independente. Noticias, lancamentos, entrevistas, reviews e muito mais do cenario musical alternativo brasileiro.',
  keywords: [
    'rock underground',
    'rock independente',
    'bandas independentes',
    'musica alternativa',
    'rock brasileiro',
    'lancamentos rock',
    'noticias rock',
    'tribhus',
  ],
  authors: [{ name: 'Tribhus' }],
  creator: 'Tribhus',
  publisher: 'Tribhus',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://blog.tribhus.com.br',
    siteName: 'Tribhus Blog',
    title: 'Tribhus Blog | Rock Underground e Independente',
    description: 'O melhor conteudo sobre rock underground e independente. Noticias, lancamentos, entrevistas e muito mais.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tribhus Blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tribhus Blog | Rock Underground e Independente',
    description: 'O melhor conteudo sobre rock underground e independente.',
    images: ['/images/og-image.jpg'],
    creator: '@tribhus',
  },
  alternates: {
    canonical: 'https://blog.tribhus.com.br',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Tribhus',
              url: 'https://tribhus.com.br',
              logo: 'https://blog.tribhus.com.br/images/logo.png',
              // Tem que bater com o sameAs do site (tribhus_next/lib/seo/jsonld.ts).
              // Handles diferentes nos dois fazem o buscador nao saber qual perfil e da
              // empresa. Mesma lista, mesma ordem, com www para casar exatamente.
              sameAs: [
                'https://www.instagram.com/tribhusbr',
                'https://www.facebook.com/tribhusbr',
                'https://www.youtube.com/@tribhus5311',
                'https://play.google.com/store/apps/details?id=com.tribhus',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contato@tribhus.com.br',
                contactType: 'customer service',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Tribhus Blog',
              url: 'https://blog.tribhus.com.br',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://blog.tribhus.com.br/busca?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
        </Script>
      </body>
    </html>
  )
}
