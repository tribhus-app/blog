/* =========================================================================
   O CONTRATO DE DADOS DO PAINEL DO BLOG

   Os nomes são os da API do blog (`/blog/api`), em inglês, os mesmos que o
   painel do ar já lê e manda. Nada aqui é campo novo.
   ========================================================================= */

export type StatusDoPost = 'draft' | 'published' | 'scheduled';
export type Periodo = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

export interface CategoriaDoPainel {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  /** A cor que o painel guarda (hex). No painel ela aparece como amostra,
   *  porque é o campo que se edita; o blog público não usa. */
  color?: string | null;
  postCount?: number;
}

export interface TagDoPainel { id: string; name: string; slug: string }

export interface AutorDoPainel {
  id: string;
  name: string;
  slug: string;
  email: string;
  bio?: string | null;
  avatar?: string | null;
  isAdmin: boolean;
  isAi: boolean;
  postCount?: number;
}

/** Um post como `/admin/posts` e `/admin/posts/:id` devolvem. */
export interface PostDoPainel {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage?: string | null;
  imageCredit?: string | null;
  imageCreditUrl?: string | null;
  ogImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  status: StatusDoPost;
  featured: boolean;
  socialPublicar?: boolean;
  scheduledAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  views: number;
  category?: { id: string; name: string; slug: string } | null;
  author?: { id: string; name: string } | null;
  tags?: TagDoPainel[];
  /** Só nos posts que a IA escreveu: a matéria de origem. */
  sourceUrl?: string | null;
  sourceName?: string | null;
}

/** O corpo que o formulário manda em `POST /posts` e `PUT /posts/:id`. */
export interface PostParaSalvar {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  categoryId?: string;
  status: StatusDoPost;
  featured: boolean;
  socialPublicar: boolean;
  scheduledAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  slug: string;
  ogImage?: string;
  authorId: string;
  tagIds?: string[];
}

export interface Estatisticas { totalPosts: number; publishedPosts: number; draftPosts: number; totalViews: number }

export interface ListaDePosts { posts: PostDoPainel[]; total: number; page: number; totalPages: number }

/* ---------- ANALYTICS ---------- */
export interface Numero { valor: number; variacao?: number | null }
export interface VisaoGeral {
  views: Numero;
  leitores: Numero;
  unicos: Numero;
  /** Em segundos. */
  tempoMedio: Numero;
  /** Em %. */
  scrollMedio: Numero;
  bots: number;
}
export interface PontoNoTempo { dia: string; views: number; unicos: number }
export interface Fatia { nome: string; total: number; pct: number }
export interface PostMaisLido { id: string; title: string; views: number; unicos: number; tempoMedio: number; scrollMedio: number }
export interface AnalyticsDoBlog {
  geral: VisaoGeral;
  tempo: PontoNoTempo[];
  fontes: Fatia[];
  aparelhos: Fatia[];
  navegadores: Fatia[];
  estados: Fatia[];
  cidades: Fatia[];
  paises: Fatia[];
  maisLidos: PostMaisLido[];
}
export interface AnalyticsDoPost {
  id: string;
  title: string;
  slug: string;
  views: number;
  totalHistorico: number;
  unicos: number;
  tempoMedio: number;
  scrollMedio: number;
  tempo: PontoNoTempo[];
  fontes: Fatia[];
  aparelhos: Fatia[];
}

/* ---------- IA ---------- */
export interface EstadoDaIA {
  ligado: boolean;
  horario: string;
  proxima?: string | null;
  ultima?: string | null;
  porExecucao: number;
  /** A categoria do dia, pelo calendário editorial. */
  hoje: string;
  /** O modo de busca do gerador (o painel antigo mostrava os dois). */
  modo?: 'tavily' | 'rss';
  /** Sem a chave do Claude no servidor, a geração não roda. */
  claudeConfigurado?: boolean;
  /** Os alertas que o scheduler devolve (por exemplo, Tavily sem chave). */
  alertas?: string[];
}
export interface NoticiaDisponivel { titulo: string; fonte: string; data: string; comImagem: boolean }

/** O que toda ação devolve: o valor, ou a mensagem que a API mandou. */
export type Resultado<T = null> = { ok: true; valor: T } | { ok: false; erro: string };
