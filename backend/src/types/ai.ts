// Tipos para o servico de IA

export interface GeneratedArticle {
  title: string
  excerpt: string
  content: string // HTML formatado
  tags: string[]
  seo: {
    metaTitle: string
    metaDescription: string
    focusKeyword: string
  }
}

export interface BandData {
  id: number
  name: string
  slug: string
  city?: string
  state?: string
  description?: string
  genres?: string[]
  startDate?: string
  socialLinks?: {
    facebook?: string
    instagram?: string
    spotify?: string
  }
}

export interface NewsItem {
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  imageUrl?: string
  content?: string
  videoUrl?: string // URL do YouTube se disponivel
}

export interface AggregatedNews {
  items: NewsItem[]
  fetchedAt: Date
  sources: string[]
}

export interface RSSFeed {
  name: string
  url: string
  active: boolean
}

export interface JobStatus {
  name: string
  lastRun: Date | null
  nextRun: Date | null
  isRunning: boolean
  lastResult?: {
    success: boolean
    articlesGenerated: number
    errors?: string[]
  }
}

export interface WebhookPayload {
  event: 'band.created' | 'band.updated'
  data: BandData
  timestamp: string
}

export interface GenerationResult {
  success: boolean
  articleId?: string
  error?: string
}

// Configuracao dos feeds RSS
export const RSS_FEEDS: RSSFeed[] = [
  // === BRASIL ===
  { name: 'Whiplash', url: 'https://whiplash.net/rss/whiplash.xml', active: true },
  { name: 'Roadie Crew', url: 'https://roadiecrew.com/feed/', active: true },
  { name: 'Rock Brazuca', url: 'https://rockbrazuca.uol.com.br/feed/', active: true },
  { name: 'Tenho Mais Discos', url: 'https://www.tenhomaisdiscosqueamigos.com/feed/', active: true },

  // === EUA ===
  { name: 'Blabbermouth', url: 'https://www.blabbermouth.net/feed/', active: true },
  { name: 'Loudwire', url: 'https://loudwire.com/feed/', active: true },
  { name: 'Metal Injection', url: 'https://metalinjection.net/feed', active: true },
  { name: 'Ultimate Guitar', url: 'https://www.ultimate-guitar.com/news/rss.xml', active: true },
  { name: 'Revolver Mag', url: 'https://www.revolvermag.com/feed', active: true },

  // === EUROPA ===
  { name: 'Metal Hammer UK', url: 'https://www.loudersound.com/feeds/metal-hammer', active: true },
  { name: 'Kerrang', url: 'https://www.kerrang.com/feed', active: true },
  { name: 'Bravewords', url: 'https://bravewords.com/feed', active: true },
  { name: 'Metal Storm', url: 'https://www.metalstorm.net/pub/rss.php', active: true },
  { name: 'Consequence Heavy', url: 'https://consequence.net/category/heavy/feed/', active: true },
]

// Constantes
export const AI_AUTHOR_NAME = 'Tribhus IA'
export const AI_AUTHOR_EMAIL = 'ia@tribhus.com.br'
export const AI_AUTHOR_SLUG = 'tribhus-ia'
export const MAX_ARTICLES_PER_RUN = 3
export const CRON_TIMEZONE = 'America/Sao_Paulo'

// ========================================
// CALENDARIO EDITORIAL
// ========================================

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // 0 = Domingo, 6 = Sabado

export interface CategoryConfig {
  slug: string
  name: string
  keywords: string[]
  promptDescription: string
}

// Configuracao de cada categoria para busca e geracao
export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  noticias: {
    slug: 'noticias',
    name: 'Noticias',
    keywords: [
      'news', 'announce', 'statement', 'confirmed', 'revealed', 'breaking',
      'noticia', 'anuncia', 'confirma', 'revela', 'oficial',
      'band', 'banda', 'rock', 'metal', 'music', 'musica',
    ],
    promptDescription: 'noticias gerais do mundo do rock e metal, incluindo anuncios, declaracoes e novidades de bandas',
  },
  lancamentos: {
    slug: 'lancamentos',
    name: 'Lancamentos',
    keywords: [
      'new album', 'new single', 'release', 'debut', 'premiere', 'drop',
      'novo album', 'novo single', 'lancamento', 'estreia', 'lanca',
      'ep', 'lp', 'track', 'song', 'music video', 'clipe', 'video',
      'stream', 'spotify', 'listen', 'ouça', 'available now',
    ],
    promptDescription: 'lancamentos de novos albuns, singles, EPs, clipes e musicas de bandas de rock e metal',
  },
  novidades: {
    slug: 'novidades',
    name: 'Novidades',
    keywords: [
      'new', 'novo', 'update', 'latest', 'fresh', 'just', 'now',
      'announce', 'reveal', 'introduce', 'launch', 'debut',
      'project', 'projeto', 'side project', 'supergroup', 'collaboration',
      'return', 'comeback', 'reunion', 'retorno', 'volta',
    ],
    promptDescription: 'novidades e atualizacoes do mundo do rock e metal, incluindo novos projetos, retornos e colaboracoes',
  },
  tecnologia: {
    slug: 'tecnologia',
    name: 'Tecnologia',
    keywords: [
      'gear', 'equipment', 'pedal', 'amp', 'amplifier', 'guitar', 'bass',
      'drum', 'kit', 'signature', 'model', 'rig', 'setup', 'tone',
      'plugin', 'software', 'daw', 'recording', 'studio', 'production',
      'fender', 'gibson', 'marshall', 'mesa boogie', 'orange', 'peavey',
      'ibanez', 'esp', 'jackson', 'schecter', 'prs', 'boss', 'line 6',
      'equipamento', 'guitarra', 'baixo', 'bateria', 'pedais',
    ],
    promptDescription: 'tecnologia e equipamentos para musicos, incluindo guitarras, amplificadores, pedais, plugins e novidades de gear',
  },
  eventos: {
    slug: 'eventos',
    name: 'Eventos',
    keywords: [
      'tour', 'concert', 'show', 'live', 'festival', 'gig', 'date',
      'turne', 'turnê', 'apresentacao', 'ao vivo', 'ingressos', 'tickets',
      'headline', 'lineup', 'setlist', 'sold out', 'esgotado',
      'rock in rio', 'lollapalooza', 'download', 'wacken', 'hellfest',
      'summer', 'winter', 'spring', 'fall', 'leg', 'north america', 'europe',
      'brasil', 'brazil', 'south america', 'america latina',
    ],
    promptDescription: 'shows, festivais, turnes e eventos de rock e metal ao redor do mundo e no Brasil',
  },
  curiosidades: {
    slug: 'curiosidades',
    name: 'Curiosidades',
    keywords: [
      'history', 'story', 'behind', 'secret', 'fact', 'trivia', 'rare',
      'historia', 'curiosidade', 'bastidores', 'segredo', 'fato', 'raro',
      'classic', 'legendary', 'iconic', 'vintage', 'anniversary', 'years ago',
      'classico', 'lendario', 'iconico', 'aniversario', 'anos atras',
      'interview', 'entrevista', 'memoir', 'autobiography', 'book', 'documentary',
    ],
    promptDescription: 'curiosidades, historias dos bastidores, fatos raros e interessantes sobre bandas e artistas de rock e metal',
  },
  reviews: {
    slug: 'reviews',
    name: 'Reviews',
    keywords: [
      'review', 'rating', 'score', 'opinion', 'critique', 'analysis',
      'resenha', 'critica', 'analise', 'avaliacao', 'nota', 'opiniao',
      'album review', 'track by track', 'breakdown', 'verdict',
      'best', 'worst', 'top', 'ranking', 'list', 'essential', 'must listen',
      'stars', 'estrelas', 'points', 'pontos', 'grade',
    ],
    promptDescription: 'reviews e criticas de albuns, shows e lancamentos de rock e metal',
  },
}

// Calendario editorial - qual categoria em cada dia da semana
// 0 = Domingo, 1 = Segunda, ..., 6 = Sabado
export const EDITORIAL_CALENDAR: Record<DayOfWeek, string> = {
  0: 'reviews',      // Domingo - Reviews
  1: 'noticias',     // Segunda - Noticias
  2: 'lancamentos',  // Terca - Lancamentos
  3: 'novidades',    // Quarta - Novidades
  4: 'tecnologia',   // Quinta - Tecnologia
  5: 'eventos',      // Sexta - Eventos
  6: 'curiosidades', // Sabado - Curiosidades
}

// Helper para pegar a categoria do dia
export function getTodayCategory(): CategoryConfig {
  const today = new Date()
  const dayOfWeek = today.getDay() as DayOfWeek
  const categorySlug = EDITORIAL_CALENDAR[dayOfWeek]
  return CATEGORY_CONFIGS[categorySlug]
}

// Helper para pegar categoria de um dia especifico
export function getCategoryForDay(day: DayOfWeek): CategoryConfig {
  const categorySlug = EDITORIAL_CALENDAR[day]
  return CATEGORY_CONFIGS[categorySlug]
}

// ========================================
// QUERIES DO TAVILY POR CATEGORIA
// ========================================
// Queries globais (mundial) para buscar noticias em ingles e portugues
// Cobertura: Brasil, EUA, Europa, Asia, Oceania, Africa, America Latina

export const TAVILY_CATEGORY_QUERIES: Record<string, string[]> = {
  noticias: [
    // Global em ingles
    'rock metal band news today 2024 2025',
    'heavy metal rock music news announcement',
    'rock band statement interview news',
    'metal music industry news worldwide',
    // Brasil e America Latina
    'noticias rock metal bandas brasil hoje',
    'rock latino america noticias bandas',
    // Regioes especificas
    'japanese rock metal band news',
    'european metal rock news bands',
    'australian rock metal band news',
    'african rock metal music scene news',
  ],

  lancamentos: [
    // Global em ingles
    'new rock metal album release 2024 2025',
    'metal band new single premiere today',
    'rock album release date announced',
    'new heavy metal EP music video release',
    // Brasil e America Latina
    'lancamento album rock metal brasil',
    'nova musica rock metal banda brasileira',
    'lancamento single rock latino',
    // Regioes especificas
    'japanese metal new album release',
    'european rock metal new release',
    'australian rock band new album',
  ],

  novidades: [
    // Global em ingles
    'rock metal band news update latest',
    'metal band comeback reunion announcement',
    'rock supergroup new project collaboration',
    'metal band new lineup member announcement',
    // Brasil e America Latina
    'novidades bandas rock metal brasil',
    'rock metal novos projetos noticias',
    'bandas rock retorno comeback brasil',
    // Regioes especificas
    'japanese rock metal band update news',
    'scandinavian metal band news update',
    'progressive metal band news project',
  ],

  tecnologia: [
    // Global em ingles - FOCO EM INFORMACOES CONFIRMADAS
    'guitarist new signature guitar announcement official',
    'rock metal band recording studio gear interview',
    'guitar amplifier pedal new release 2024 2025',
    'metal guitarist rig rundown equipment confirmed',
    // Brasil e America Latina
    'equipamento guitarra rock metal brasil',
    'guitarrista setup pedais amplificador entrevista',
    'estudio gravacao rock metal equipamentos',
    // Fabricantes e produtos
    'fender gibson new guitar model release',
    'marshall orange amp new product announcement',
    'boss line6 new pedal effect release',
  ],

  eventos: [
    // Global em ingles
    'rock metal tour dates 2024 2025 announced',
    'metal festival lineup announcement',
    'rock concert tour announcement worldwide',
    'metal band live show festival confirmed',
    // Brasil e America Latina
    'show rock metal brasil turne datas',
    'festival rock metal america latina',
    'bandas rock metal shows brasil 2024 2025',
    // Festivais famosos
    'rock in rio lollapalooza lineup news',
    'wacken hellfest download festival lineup',
    'summer breeze bloodstock festival news',
    // Regioes especificas
    'japan rock metal festival tour dates',
    'australia rock metal tour dates 2024',
  ],

  curiosidades: [
    // Global em ingles
    'rock metal band history story behind the scenes',
    'legendary rock band interview rare facts',
    'metal band documentary book memoir news',
    'rock music history anniversary celebration',
    // Brasil e America Latina
    'historia bandas rock metal brasil curiosidades',
    'bastidores rock metal entrevista historia',
    'rock brasileiro historia fatos curiosos',
    // Temas interessantes
    'classic rock album anniversary story',
    'metal band formation origin story interview',
    'rock legend untold story documentary',
    'iconic rock album recording secrets revealed',
  ],

  reviews: [
    // Global em ingles
    'rock metal album review 2024 2025',
    'new metal album review rating score',
    'rock album review critic opinion',
    'heavy metal release review analysis',
    // Brasil e America Latina
    'review album rock metal brasileiro',
    'critica album rock metal lancamento',
    'resenha disco rock metal novo',
    // Especificos
    'progressive metal album review',
    'thrash metal new album review',
    'hard rock album review 2024',
    'death metal album review rating',
  ],
}
