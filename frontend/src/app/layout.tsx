import type { Metadata } from 'next'
import Script from 'next/script'
import { Archivo, Martian_Mono } from 'next/font/google'
import './globals.css'
// A casa da Tribhus (pacote do redesenho de 30/10/2026). Os CSS da casa sao os do
// SITE (/opt/tribhus_next/components/tribhus/css), nao os do zip; depois deles o do
// blog e o do painel, e por ultimo a ligacao das fontes.
import '@/styles/casa/01-tokens.css'
import '@/styles/casa/02-casca.css'
import '@/styles/casa/35-blog.css'
import '@/styles/casa/36-blog-admin.css'
import '@/styles/casa/99-blog.css'
import LayoutWrapper from '@/components/layout/LayoutWrapper'

// As duas familias da casa, as mesmas do site (app/[locale]/layout.tsx de la).
const archivo = Archivo({ subsets: ['latin'], display: 'swap', axes: ['wdth'], variable: '--font-archivo' })
const martianMono = Martian_Mono({ subsets: ['latin'], display: 'swap', axes: ['wdth'], variable: '--font-martian' })

// GA4 — MESMA propriedade do tribhus.com.br (224591904), de propósito: é o que deixa
// visível a jornada blog -> site (post lido -> cadastro). Duas propriedades separadas
// dariam dois relatórios que nunca se cruzam, e o blog nunca receberia o crédito.
// Exige medição entre domínios ligada no GA4 (Admin -> Fluxos de dados -> Configurar
// domínios), senão quem vai do blog pro site conta como visitante novo.
const GA4_ID = 'G-5MXSFYGFSF'

export const metadata: Metadata = {
  metadataBase: new URL('https://tribhus.com/blog'),
  // SEM `template` de proposito (removido em 21/08/2026, auditoria de SEO).
  //
  // O sufixo ' | Tribhus Blog' custava 15 caracteres em TODO post. Medido sobre os 353:
  // mediana de 71 caracteres, e so 43 (12%) cabiam nos ~60 que o Google mostra. Sem o
  // sufixo a mediana cai para 56 e 343 dos 353 passam a caber. Encurtar para
  // ' | Tribhus' resolveria so 78 — o problema e o sufixo existir, nao o tamanho dele.
  // A marca ja aparece no dominio dentro do resultado de busca.
  //
  // Bonus: /tag e /categoria JA escreviam ' | Tribhus Blog' no proprio texto, entao o
  // template duplicava ('Posts sobre Punk | Tribhus Blog | Tribhus Blog').
  //
  // Se for reintroduzir, meca antes o tamanho real dos titulos com as entidades HTML
  // decodificadas — medir no HTML cru infla o numero.
  // Titulo simples (string), NAO o formato de objeto: o TypeScript exige `template`
  // dentro do objeto, e template e exatamente o que nao queremos aqui. Assim a home usa
  // este titulo e cada pagina filha define o seu, sem sufixo herdado.
  title: 'Tribhus Blog | Rock Underground e Independente',
  description: 'O melhor conteúdo sobre rock underground e independente. Notícias, lançamentos, entrevistas, reviews e muito mais do cenário musical alternativo brasileiro.',
  keywords: [
    'rock underground',
    'rock independente',
    'bandas independentes',
    'musica alternativa',
    'rock brasileiro',
    'lançamentos rock',
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
    url: 'https://tribhus.com/blog',
    siteName: 'Tribhus Blog',
    title: 'Tribhus Blog | Rock Underground e Independente',
    description: 'O melhor conteúdo sobre rock underground e independente. Notícias, lançamentos, entrevistas e muito mais.',
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
    description: 'O melhor conteúdo sobre rock underground e independente.',
    images: ['/images/og-image.jpg'],
    creator: '@tribhus',
  },
  alternates: {
    canonical: 'https://tribhus.com/blog',
  },
  icons: {
    icon: '/blog/favicon.ico',
    shortcut: '/blog/favicon-16x16.png',
    apple: '/blog/apple-touch-icon.png',
  },
  manifest: '/blog/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${martianMono.variable}`}>
      <head>
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Tribhus',
              url: 'https://tribhus.com',
              logo: 'https://tribhus.com/blog/images/logo.png',
              // Tem que bater com o sameAs do site (tribhus_next/lib/seo/jsonld.ts).
              // Handles diferentes nos dois fazem o buscador nao saber qual perfil e da
              // empresa. Mesma lista, mesma ordem, com www para casar exatamente.
              sameAs: [
                'https://www.instagram.com/tribhusbr',
                'https://www.facebook.com/tribhusbr',
                'https://www.youtube.com/@tribhus5311',
                'https://www.linkedin.com/company/tribhusbr/',
                'https://play.google.com/store/apps/details?id=com.tribhus',
              ],
              // Fundacao e sede: mesmos valores do site (tribhus_next/lib/seo/jsonld.ts)
              // e da pagina do LinkedIn. Informados pelo William em 09/10/2026.
              foundingDate: '2020-05',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Limeira',
                addressRegion: 'SP',
                addressCountry: 'BR',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contato@tribhus.com',
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
              url: 'https://tribhus.com/blog',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://tribhus.com/blog/busca?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body>
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
