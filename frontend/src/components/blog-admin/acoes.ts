'use client';

import Cookies from 'js-cookie';
import {
  chamarApi, mensagemDaApi, paraCategoria, paraEstadoDaIA, paraNoticias, API_URL,
  type PreviewDaApi, type SchedulerDaApi, type UsuarioDaApi,
} from '@/lib/painel';
import type { AutorDoPainel, CategoriaDoPainel, EstadoDaIA, NoticiaDisponivel, PostDoPainel, PostParaSalvar, Resultado, TagDoPainel } from './tipos';

/* =========================================================================
   AS AÇÕES DO PAINEL DO BLOG: o único arquivo para ligar

   Cada função é uma chamada que o painel do ar JÁ FAZ hoje, com o mesmo
   corpo, na API do blog (`/blog/api`, com `Authorization: Bearer` do
   cookie `admin_token`). Troque o corpo de cada uma pelo cliente de API do
   painel e mantenha o que ela devolve: `{ ok: true, valor }` ou
   `{ ok: false, erro }`, com a mensagem que a API mandou.

   ENTRAR
     entrar             POST   /auth/login        { email, password }
                               (devolve { token, user }; sem user.isAdmin,
                               o erro é "Acesso negado. Apenas
                               administradores."; o token vai para o
                               cookie admin_token, 7 dias)
     sair               apaga o cookie admin_token e vai para /admin/login

   OS POSTS
     publicar           PATCH  /posts/:id/publish
     despublicar        PATCH  /posts/:id/unpublish
     excluirPost        DELETE /posts/:id
     salvarPost         POST   /posts             (novo)
                        PUT    /posts/:id         (editar)
                               corpo: PostParaSalvar (os nomes do ar)
     enviarImagem       POST   /api/upload        FormData: image
                               (devolve { url })
     criarTag           POST   /tags              { name }

   CATEGORIAS E AUTORES
     salvarCategoria    POST   /categories  |  PUT /categories/:id
                               { name, slug, description, color }
     excluirCategoria   DELETE /categories/:id
     salvarAutor        POST   /authors     |  PUT /authors/:id
                               { name, slug, email, password (vazia no
                               editar = manter), bio, avatar, isAdmin, isAi }
     excluirAutor       DELETE /authors/:id

   A IA
     ligarScheduler     POST   /ai/scheduler/start
     desligarScheduler  POST   /ai/scheduler/stop
     gerarAgora         POST   /api/ai/generate/news   { category? }
                               (demora de 2 a 3 minutos; o ar corta em 5)

   O que só lê (a lista, os números, o analytics, o estado da IA) chega
   pelas páginas, que o ar busca com:
     /auth/me, /admin/stats, /admin/posts?page=&limit=&status=&category=
     &search=, /admin/posts/:id, /categories, /tags, /authors,
     /admin/analytics/{overview,timeseries,top-posts,sources,devices,geo}
     ?period=, /admin/analytics/posts/:id?period=, /ai/scheduler/status,
     /ai/jobs/status, /ai/news/preview?limit=

   LIGADO NO AR em 31/10/2026: cada função chama a API de verdade (o
   cliente e as conversões estão em src/lib/painel.ts). O que a API do ar
   faz diferente do que o pacote supunha está anotado em cada função.
   ========================================================================= */

const tokenDoPainel = () => Cookies.get('admin_token');

/* Transforma a Resposta do cliente no Resultado das telas. */
async function acao<T, V = T>(caminho: string, init: RequestInit & { erroPadrao?: string }, converter?: (v: T) => V): Promise<Resultado<V>> {
  const r = await chamarApi<T>(tokenDoPainel(), caminho, init);
  if (!r.ok) return { ok: false, erro: r.erro };
  return { ok: true, valor: converter ? converter(r.valor) : (r.valor as unknown as V) };
}

/* ---------- ENTRAR E SAIR ---------- */

/** POST /auth/login. `lembrar` decide o cookie: 7 dias, ou até fechar o
 *  navegador (sem `expires`). Quem não é admin não ganha cookie. */
export async function entrar(email: string, senha: string, lembrar = true): Promise<Resultado<{ nome: string }>> {
  if (!email.trim() || !senha) return { ok: false, erro: 'Preencha o e-mail e a senha.' };
  const r = await chamarApi<{ token: string; user: UsuarioDaApi }>(undefined, '/auth/login', {
    method: 'POST', body: JSON.stringify({ email: email.trim(), password: senha }), erroPadrao: 'Erro ao fazer login',
  });
  if (!r.ok) return { ok: false, erro: r.status === 401 ? 'E-mail ou senha incorretos' : r.erro };
  if (!r.valor.user?.isAdmin) return { ok: false, erro: 'Acesso negado. Apenas administradores.' };
  Cookies.set('admin_token', r.valor.token, lembrar ? { expires: 7 } : undefined);
  return { ok: true, valor: { nome: r.valor.user.name } };
}

export function sair() {
  Cookies.remove('admin_token');
  location.href = '/blog/admin/login';
}

/* ---------- OS POSTS ---------- */

export const publicar = (id: string) => acao<unknown, string>(`/posts/${id}/publish`, { method: 'PATCH', erroPadrao: 'Erro ao publicar post' }, () => id);
export const despublicar = (id: string) => acao<unknown, string>(`/posts/${id}/unpublish`, { method: 'PATCH', erroPadrao: 'Erro ao despublicar post' }, () => id);
export const excluirPost = (id: string) => acao<unknown, string>(`/posts/${id}`, { method: 'DELETE', erroPadrao: 'Não foi possível excluir o post.' }, () => id);

/** POST /posts (novo) ou PUT /posts/:id. A API não tem campo de imagem das
 *  redes (ogImage): o zod dela descarta, então nem vai. */
export async function salvarPost(id: string | null, corpo: PostParaSalvar): Promise<Resultado<{ id: string; slug: string }>> {
  if (!corpo.title.trim()) return { ok: false, erro: 'O post precisa de um título.' };
  const { ogImage: _og, ...resto } = corpo;
  void _og;
  return acao<{ data: PostDoPainel }, { id: string; slug: string }>(id ? `/posts/${id}` : '/posts', {
    method: id ? 'PUT' : 'POST', body: JSON.stringify(resto), erroPadrao: 'Erro ao salvar post',
  }, (r) => ({ id: r.data.id, slug: r.data.slug }));
}

/** POST /api/upload, FormData com `image`. Vai por XHR para a barra de
 *  envio andar de verdade. */
export function enviarImagem(arquivo: File, aoAndar?: (pct: number) => void): Promise<Resultado<{ url: string }>> {
  if (arquivo.size > 10 * 1024 * 1024) return Promise.resolve({ ok: false, erro: 'A imagem passa de 10 MB.' });
  return new Promise((fim) => {
    const xhr = new XMLHttpRequest();
    const dados = new FormData();
    dados.append('image', arquivo);
    xhr.open('POST', `${API_URL}/api/upload`);
    const t = tokenDoPainel();
    if (t) xhr.setRequestHeader('Authorization', `Bearer ${t}`);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) aoAndar?.(Math.round((e.loaded / e.total) * 95)); };
    xhr.onload = () => {
      let corpo: { url?: string; error?: string } | null = null;
      try { corpo = JSON.parse(xhr.responseText); } catch { /* resposta sem JSON */ }
      if (xhr.status >= 200 && xhr.status < 300 && corpo?.url) { aoAndar?.(100); fim({ ok: true, valor: { url: corpo.url } }); }
      else fim({ ok: false, erro: corpo?.error || 'Falha no upload da imagem' });
    };
    xhr.onerror = () => fim({ ok: false, erro: 'Falha no upload da imagem' });
    xhr.send(dados);
  });
}

/** POST /tags { name } (rota criada em 31/10/2026; antes não existia e o
 *  painel antigo dava "Rota nao encontrada"). A API faz o slug pelo nome e,
 *  se a tag já existe, devolve a que existe. */
export const criarTag = (nome: string): Promise<Resultado<TagDoPainel>> =>
  acao<{ data: TagDoPainel }, TagDoPainel>('/tags', {
    method: 'POST',
    body: JSON.stringify({ name: nome.trim(), slug: nome.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }),
    erroPadrao: 'Não foi possível criar a tag.',
  }, (r) => r.data);

/* ---------- CATEGORIAS E AUTORES ---------- */

/** O slug a API faz sozinha a partir do nome (ignora o que vier). */
export const salvarCategoria = (c: Omit<CategoriaDoPainel, 'id' | 'postCount'> & { id?: string }) =>
  acao<{ data: CategoriaDoPainel }, CategoriaDoPainel>(c.id ? `/categories/${c.id}` : '/categories', {
    method: c.id ? 'PUT' : 'POST',
    body: JSON.stringify({ name: c.name, slug: c.slug, description: c.description ?? null, color: c.color }),
    erroPadrao: 'Erro ao salvar categoria',
  }, (r) => paraCategoria(r.data));
export const excluirCategoria = (id: string) => acao<unknown, string>(`/categories/${id}`, { method: 'DELETE', erroPadrao: 'Não foi possível excluir a categoria.' }, () => id);

/** No editar, a senha só vai se foi digitada (vazia mantém a atual). */
export const salvarAutor = (a: Omit<AutorDoPainel, 'id' | 'postCount'> & { id?: string; password?: string }) => {
  const { id, ...resto } = a;
  return acao<{ data: AutorDoPainel }, AutorDoPainel>(id ? `/authors/${id}` : '/authors', {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(resto),
    erroPadrao: 'Erro ao salvar autor',
  }, (r) => ({ ...r.data, postCount: r.data.postCount ?? 0 }));
};
export const excluirAutor = (id: string) => acao<unknown, string>(`/authors/${id}`, { method: 'DELETE', erroPadrao: 'Não foi possível excluir o autor.' }, () => id);

/* ---------- A IA ---------- */

/* start/stop devolvem só { success, message }: o estado novo (próxima
   execução) vem de /ai/scheduler/status logo depois. */
async function trocarScheduler(caminho: string, e: EstadoDaIA, ligado: boolean): Promise<Resultado<EstadoDaIA>> {
  const r = await chamarApi<{ success: boolean; message?: string }>(tokenDoPainel(), caminho, { method: 'POST', erroPadrao: 'Erro ao alterar scheduler' });
  if (!r.ok) return { ok: false, erro: r.erro };
  const s = await chamarApi<SchedulerDaApi>(tokenDoPainel(), '/ai/scheduler/status');
  return { ok: true, valor: s.ok ? paraEstadoDaIA(s.valor) : { ...e, ligado } };
}
export const ligarScheduler = (e: EstadoDaIA) => trocarScheduler('/ai/scheduler/start', e, true);
export const desligarScheduler = (e: EstadoDaIA) => trocarScheduler('/ai/scheduler/stop', e, false);

/** POST /api/ai/generate/news { category? }. Leva de 2 a 3 minutos; corta
 *  em 5, como o painel antigo. A API responde 200 com `success: false`
 *  quando não acha notícia, e `message` quando todas já viraram artigo. */
export async function gerarAgora(categoria: string | null): Promise<Resultado<{ gerados: number; mensagem?: string }>> {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), 300000);
  try {
    const t = tokenDoPainel();
    const res = await fetch(`${API_URL}/api/ai/generate/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
      body: JSON.stringify({ category: categoria || undefined }),
      signal: controle.signal,
    });
    if (!res.ok) return { ok: false, erro: await mensagemDaApi(res, 'Erro ao gerar artigos. Verifique os logs do servidor.') };
    const r = (await res.json()) as { success: boolean; articlesGenerated?: number; category?: string; message?: string; error?: string };
    if (!r.success) return { ok: false, erro: r.error || 'Erro ao gerar artigos. Verifique os logs do servidor.' };
    const gerados = r.articlesGenerated ?? 0;
    return { ok: true, valor: { gerados, mensagem: gerados ? undefined : r.message || `Nenhum artigo novo para gerar em "${r.category ?? 'categoria do dia'}".` } };
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') return { ok: false, erro: 'Tempo limite excedido. A geração pode ainda estar em andamento: confira os rascunhos.' };
    return { ok: false, erro: 'Erro ao gerar artigos. Verifique os logs do servidor.' };
  } finally {
    clearTimeout(relogio);
  }
}

/** GET /ai/news/preview?limit=5 (o painel antigo pedia 5). Fica no
 *  navegador porque a API busca os RSS na hora e pode demorar. */
export const atualizarNoticias = (): Promise<Resultado<NoticiaDisponivel[]>> =>
  acao<PreviewDaApi, NoticiaDisponivel[]>('/ai/news/preview?limit=5', { erroPadrao: 'Erro ao buscar as notícias.' }, paraNoticias);

export type { PostDoPainel };
