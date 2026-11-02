'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { despublicar, excluirPost, publicar } from './acoes';
import { CabecaDaTela, Status, data, numero } from './comum';
import { Icone } from './icones';
import { Confirmar, avisar } from './pecas';
import type { CategoriaDoPainel, ListaDePosts, PostDoPainel } from './tipos';

/* =========================================================================
   POSTS (/admin/posts)

   A mesma tela do ar, na mesma ordem: a busca, o filtro de status, o de
   categoria e Buscar; a tabela com Título, Categoria, Status, Views, Data
   e Ações; embaixo, "Mostrando 20 de N posts" e a paginação. As ações de
   cada linha continuam na mesma ordem (Despublicar ou Publicar, Editar,
   Ver no blog, Excluir), agora como botões redondos com o nome ao passar
   o mouse, e Excluir pede confirmação na janela da casa.

   Publicar e despublicar mudam a linha na hora e confirmam com o aviso de
   baixo; se a API recusar, a linha volta e o aviso diz por quê.

   Os filtros vão na URL (?status=&category=&search=&page=), como a busca
   do blog: dá para voltar, recarregar e mandar o link. No ar, a mesma
   lista vem de /admin/posts com esses parâmetros.
   ========================================================================= */

type Filtros = { status: string; category: string; search: string };

export function Posts({ lista, categorias, filtros }: { lista: ListaDePosts; categorias: CategoriaDoPainel[]; filtros: Filtros }) {
  const router = useRouter();
  const caminho = usePathname();
  const [posts, setPosts] = useState(lista.posts);
  const [chave, setChave] = useState(lista);
  const [indo, setIndo] = useState<string | null>(null);
  const [excluir, setExcluir] = useState<PostDoPainel | null>(null);
  const [f, setF] = useState(filtros);
  if (chave !== lista) { setChave(lista); setPosts(lista.posts); }

  function ir(novos: Partial<Filtros> & { page?: number }) {
    const q = new URLSearchParams();
    const t = { ...f, ...novos };
    if (t.search.trim()) q.set('search', t.search.trim());
    if (t.status) q.set('status', t.status);
    if (t.category) q.set('category', t.category);
    if (novos.page && novos.page > 1) q.set('page', String(novos.page));
    router.push(q.toString() ? `${caminho}?${q}` : caminho, { scroll: false });
  }
  function buscar(e: FormEvent) { e.preventDefault(); ir({}); }

  async function trocar(p: PostDoPainel) {
    const vai = p.status === 'published' ? 'draft' : 'published';
    setIndo(p.id);
    setPosts((l) => l.map((x) => (x.id === p.id ? { ...x, status: vai } : x)));
    const r = vai === 'published' ? await publicar(p.id) : await despublicar(p.id);
    setIndo(null);
    if (r.ok) { avisar(vai === 'published' ? 'Post publicado' : 'Post despublicado, virou rascunho'); router.refresh(); }
    else { setPosts((l) => l.map((x) => (x.id === p.id ? p : x))); avisar(r.erro, true); }
  }

  const ini = (lista.page - 1) * 20;
  return (
    <div className="adm-posts">
      <CabecaDaTela
        titulo="Posts"
        acao={<Link className="adm-bt cheio" href="/admin/posts/new"><Icone nome="mais" tamanho={18} />Novo Post</Link>}
      />

      <form className="adm-filtros" onSubmit={buscar} role="search">
        <label className="adm-busca">
          <span className="adm-so-leitor">Buscar posts</span>
          <Icone nome="busca" tamanho={18} />
          <input className="adm-entrada" type="search" placeholder="Buscar posts..." value={f.search} onChange={(e) => setF({ ...f, search: e.target.value })} />
        </label>
        <select className="adm-entrada" aria-label="Status" value={f.status} onChange={(e) => { setF({ ...f, status: e.target.value }); ir({ status: e.target.value }); }}>
          <option value="">Todos os status</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
          <option value="scheduled">Agendados</option>
        </select>
        <select className="adm-entrada" aria-label="Categoria" value={f.category} onChange={(e) => { setF({ ...f, category: e.target.value }); ir({ category: e.target.value }); }}>
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="adm-bt" type="submit">Buscar</button>
      </form>

      <section className="adm-quadro">
        {posts.length ? (
          <div className="adm-tabela-rolagem">
            <table className="adm-tabela adm-tabela-posts">
              <thead>
                <tr><th>Título</th><th>Categoria</th><th>Status</th><th className="num">Views</th><th>Data</th><th className="num">Ações</th></tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} data-indo={indo === p.id ? '' : undefined}>
                    <td>
                      <Link className="adm-post-t" href={`/admin/posts/${p.id}/edit`}>
                        <span className="adm-miniatura">{p.coverImage ? <img src={p.coverImage} alt="" width={48} height={48} loading="lazy" /> : null}</span>
                        <span>
                          <b>{p.title}</b>
                          {p.featured ? <span className="adm-destaque"><Icone nome="destaque" tamanho={11} />Destacado</span> : null}
                        </span>
                      </Link>
                    </td>
                    <td className="adm-cat">{p.category?.name ?? 'Sem categoria'}</td>
                    <td><Status s={p.status} /></td>
                    <td className="num">{numero(p.views)}</td>
                    <td className="data">{p.status === 'scheduled' ? data(p.scheduledAt) : data(p.publishedAt ?? p.createdAt)}</td>
                    <td>
                      <div className="adm-acoes">
                        <button type="button" className="adm-bt-ic" onClick={() => trocar(p)} disabled={indo === p.id}
                          aria-label={p.status === 'published' ? 'Despublicar' : 'Publicar'} title={p.status === 'published' ? 'Despublicar' : 'Publicar'}>
                          <Icone nome={p.status === 'published' ? 'esconder' : 'publicar'} tamanho={18} />
                        </button>
                        <Link className="adm-bt-ic" href={`/admin/posts/${p.id}/edit`} aria-label="Editar" title="Editar"><Icone nome="editar" tamanho={18} /></Link>
                        {p.status === 'published' ? (
                          <a className="adm-bt-ic" href={`/blog/${p.slug}`} target="_blank" rel="noopener" aria-label="Ver no blog" title="Ver no blog"><Icone nome="verBlog" tamanho={18} /></a>
                        ) : <span className="adm-bt-ic adm-bt-ic-vazio" aria-hidden="true" />}
                        <button type="button" className="adm-bt-ic" data-perigo onClick={() => setExcluir(p)} aria-label="Excluir" title="Excluir"><Icone nome="excluir" tamanho={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="adm-vazio">
            <b>Nenhum post encontrado</b>
            {f.search || f.status || f.category
              ? <button type="button" className="adm-bt" onClick={() => { setF({ status: '', category: '', search: '' }); router.push(caminho); }}>Limpar os filtros</button>
              : <Link className="adm-bt cheio" href="/admin/posts/new"><Icone nome="mais" tamanho={18} />Criar primeiro post</Link>}
          </div>
        )}
      </section>

      {lista.total > 0 ? (
        <nav className="adm-paginas" aria-label="Páginas">
          <p>Mostrando {numero(Math.min(lista.total, ini + posts.length) - ini)} de {numero(lista.total)} posts</p>
          <div>
            <button type="button" className="adm-bt" disabled={lista.page <= 1} onClick={() => ir({ page: lista.page - 1 })}>
              <Icone nome="voltar" tamanho={16} />Anterior
            </button>
            <span className="adm-paginas-n">Página {lista.page} de {lista.totalPages}</span>
            <button type="button" className="adm-bt" disabled={lista.page >= lista.totalPages} onClick={() => ir({ page: lista.page + 1 })}>
              Próxima<Icone nome="seta" tamanho={16} />
            </button>
          </div>
        </nav>
      ) : null}

      {excluir ? (
        <Confirmar
          titulo="Excluir este post?"
          texto={<><b>{excluir.title}</b> sai do blog e do painel. Não dá para desfazer.</>}
          aoFechar={() => setExcluir(null)}
          aoConfirmar={async () => {
            const r = await excluirPost(excluir.id);
            if (!r.ok) return r.erro;
            setPosts((l) => l.filter((x) => x.id !== excluir.id));
            avisar('Post excluído');
            router.refresh();
            return null;
          }}
        />
      ) : null}
    </div>
  );
}
