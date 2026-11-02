/* =========================================================================
   O CONTRATO DE DADOS DO BLOG

   O blog tem API própria, só de leitura, em `/blog/api/` (posts, posts/slug,
   posts/popular, posts/featured, categories, tags). Os nomes abaixo são os
   DELA, em inglês, para a integração não precisar traduzir campo por campo.
   Nada aqui é campo novo: o que o redesign calcula (tempo de leitura, o
   índice, a série), ele tira do próprio texto.
   ========================================================================= */


export interface CategoriaDoBlog {
  name: string;
  slug: string;
  description?: string | null;
  /** A cor que o painel do blog guarda. O redesign NÃO usa: oito cores
   *  saturadas numa página escura eram o que dava cara de modelo pronto, e
   *  três delas não passavam no contraste. */
  color?: string | null;
}

export interface AutorDoBlog {
  name: string;
  slug: string;
  bio?: string | null;
  avatar?: string | null;
}

export interface TagDoBlog {
  name: string;
  slug: string;
}

/** Um artigo, como `/posts/slug/<slug>` devolve. */
export interface ArtigoDoBlog {
  slug: string;
  title: string;
  excerpt?: string | null;
  /* a descrição que o blog já grava para o Google; vale de resumo quando
     o artigo não tem `excerpt` (o caso da série Descobertas, por exemplo) */
  metaDescription?: string | null;
  /** O <title> da página do artigo, sem o nome da marca (como no ar). */
  metaTitle?: string | null;
  /** O corpo. HTML nos de 2026, Markdown nos antigos: o site converte o
   *  Markdown para HTML antes (é o que ele já faz hoje). */
  content: string;
  coverImage?: string | null;
  imageCredit?: string | null;
  imageCreditUrl?: string | null;
  publishedAt: string;
  updatedAt?: string | null;
  featured?: boolean;
  sourceUrl?: string | null;
  sourceName?: string | null;
  category: CategoriaDoBlog;
  author: AutorDoBlog;
  tags?: TagDoBlog[];
}

/** O cartão de um artigo nas listas (capa, categoria, relacionados). */
export type ResumoDoArtigo = Pick<ArtigoDoBlog,
  'slug' | 'title' | 'excerpt' | 'metaDescription' | 'coverImage' | 'publishedAt' | 'category' | 'featured'>;

/* ---------- AS BANDAS DA MATÉRIA ----------
   O que faz este blog ser da Tribhus: a banda de que o texto fala está aqui
   dentro, e toca. O site já sabe quais são: o corpo do artigo tem os links
   `tribhus.com/bandas/<slug>` (214 links para 192 perfis no ar). Para cada
   um, a página busca a banda pelo endpoint que a página da banda já usa e
   passa aqui. Nenhum campo novo no blog. */
export interface BandaDaMateria {
  slug: string;
  nome: string;
  cidade?: string | null;
  genero?: string | null;
  fotoUrl?: string | null;
  /** A faixa que toca: a primeira do disco mais novo, do mesmo endpoint da
   *  página da banda (`faixaDaBanda.ts`). Sem ela, a ficha leva à banda, sem
   *  play. */
  faixa?: FaixaParaTocar | null;
}

/* ---------- A CAPA DO BLOG ----------
   Tudo da API que a capa já usa: os posts mais recentes (`/posts`), os mais
   lidos (`/posts/popular`) e as categorias (`/categories`). A foto de cada
   categoria é a capa do artigo mais recente dela, tirada da mesma lista. */
export type CartaoDaCapa = ResumoDoArtigo & { author?: { name: string; avatar?: string | null } };
export interface CategoriaDaCapa extends CategoriaDoBlog { capa?: string | null }
export interface CapaDoBlog {
  recentes: CartaoDaCapa[];
  maisLidas: CartaoDaCapa[];
  categorias: CategoriaDaCapa[];
}

/** Uma faixa como o player do "Ouça enquanto lê" recebe. No site o mesmo
 *  formato mora em `disco/tocador.ts`; o blog não tem aquele player. */
export interface FaixaParaTocar {
  id: number;
  titulo: string;
  banda: string;
  capaUrl?: string | null;
  audioUrl: string;
  duracaoSegundos?: number | null;
}
