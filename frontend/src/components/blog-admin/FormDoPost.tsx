'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { criarTag, salvarPost } from './acoes';
import { CabecaDaTela, slugar } from './comum';
import { EditorDoPost } from './EditorDoPost';
import { Icone } from './icones';
import { avisar } from './pecas';
import { Solta } from './Solta';
import type { CategoriaDoPainel, PostDoPainel, PostParaSalvar, StatusDoPost, TagDoPainel } from './tipos';

/* =========================================================================
   NOVO POST E EDITAR POST (/admin/posts/new, /admin/posts/:id/edit)

   O formulário do ar, com tudo onde estava. À esquerda: o título, o
   Conteúdo com a barra, o Resumo, o SEO (Palavra-chave, Meta Title com
   0/60, Meta Description com 0/160, URL/Slug, a imagem das redes e o
   Preview do Google). À direita: Publicar (Status, Destacar post,
   Divulgar nas redes sociais, Salvar Rascunho e Publicar), Imagem de
   Capa, Créditos da Imagem, Categoria e Tags.

   O acabamento:
   - o título é a primeira coisa e é grande, como numa folha;
   - a barra do editor fica presa no alto enquanto o texto rola;
   - as caixinhas do ar viraram chaves; "Agendado" abre a data ali mesmo,
     e Publicar vira "Agendar";
   - o slug nasce do título enquanto ninguém mexe nele;
   - os contadores ficam âmbar quando passam de 60 e de 160;
   - "Alterações não salvas" aparece ao lado dos botões, Ctrl+S salva, e
     sair da página com coisa por salvar pergunta antes;
   - as Tags ganharam uma busca em cima e as escolhidas vêm primeiro (no
     ar eram 110 etiquetas soltas); "Nova tag" continua embaixo.

   LIGADO NO AR (31/10/2026):
   - o editor é o TipTap de sempre (EditorDoPost.tsx), não o do exemplo;
   - a "Imagem para redes sociais (OG Image)" saiu: a API do blog não tem
     esse campo (o painel antigo mostrava e nunca mandava);
   - a data do Agendado é lida e escrita no horário de quem está no painel
     (o painel antigo mostrava o horário UTC, 3 horas adiantado).
   ========================================================================= */

/* ISO da API -> valor do <input type="datetime-local">, no horário local. */
function paraCampoDeData(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function FormDoPost({ post, categorias, tags: tagsIniciais, autorId }: {
  post: PostDoPainel | null;
  categorias: CategoriaDoPainel[];
  tags: TagDoPainel[];
  autorId: string;
}) {
  const router = useRouter();
  const editar = !!post;
  const [titulo, setTitulo] = useState(post?.title ?? '');
  const [conteudo, setConteudo] = useState(post?.content ?? '');
  const [resumo, setResumo] = useState(post?.excerpt ?? '');
  const [chave, setChave] = useState(post?.focusKeyword ?? '');
  const [metaT, setMetaT] = useState(post?.metaTitle ?? '');
  const [metaD, setMetaD] = useState(post?.metaDescription ?? '');
  const [slug, setSlug] = useState(post?.slug ?? '');
  const [slugTocado, setSlugTocado] = useState(editar);
  const [status, setStatus] = useState<StatusDoPost>(post?.status ?? 'draft');
  const [quando, setQuando] = useState(paraCampoDeData(post?.scheduledAt));
  const [destaque, setDestaque] = useState(!!post?.featured);
  const [redes, setRedes] = useState(!!post?.socialPublicar);
  const [capa, setCapa] = useState(post?.coverImage ?? '');
  const [credito, setCredito] = useState(post?.imageCredit ?? '');
  const [creditoUrl, setCreditoUrl] = useState(post?.imageCreditUrl ?? '');
  const [categoria, setCategoria] = useState(post?.category?.id ?? '');
  const [tags, setTags] = useState(tagsIniciais);
  const [escolhidas, setEscolhidas] = useState<string[]>(post?.tags?.map((t) => t.id) ?? []);
  const [busca, setBusca] = useState('');
  const [nova, setNova] = useState('');
  const [seo, setSeo] = useState(true);
  const [salvando, setSalvando] = useState<null | 'rascunho' | 'publicar'>(null);
  const [erro, setErro] = useState('');
  const [sujo, setSujo] = useState(false);
  const primeira = useRef(true);

  const marcar = <T,>(f: (v: T) => void) => (v: T) => { f(v); setSujo(true); };

  useEffect(() => { if (!slugTocado) setSlug(slugar(titulo)); }, [titulo, slugTocado]);
  useEffect(() => {
    if (primeira.current) { primeira.current = false; return; }
    if (!sujo) return;
    const antes = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', antes);
    return () => window.removeEventListener('beforeunload', antes);
  }, [sujo]);

  async function salvar(como: 'rascunho' | 'publicar') {
    setErro('');
    if (!titulo.trim()) { setErro('O post precisa de um título.'); document.getElementById('adm-titulo')?.focus(); return; }
    if (status === 'scheduled' && como === 'publicar' && !quando) { setErro('Escolha a data de publicação.'); document.getElementById('adm-quando')?.focus(); return; }
    const final: StatusDoPost = como === 'rascunho' ? 'draft' : editar ? status : status === 'scheduled' ? 'scheduled' : 'published';
    const corpo: PostParaSalvar = {
      title: titulo.trim(), excerpt: resumo || undefined, content: conteudo, coverImage: capa || undefined,
      imageCredit: credito || undefined, imageCreditUrl: creditoUrl || undefined, categoryId: categoria || undefined,
      status: final, featured: destaque, socialPublicar: redes,
      scheduledAt: final === 'scheduled' && quando ? new Date(quando).toISOString() : undefined,
      metaTitle: metaT || undefined, metaDescription: metaD || undefined, focusKeyword: chave || undefined,
      slug: slug || slugar(titulo), authorId: autorId, tagIds: escolhidas.length ? escolhidas : undefined,
    };
    setSalvando(como);
    const r = await salvarPost(post?.id ?? null, corpo);
    setSalvando(null);
    if (!r.ok) { setErro(r.erro); return; }
    setSujo(false); setStatus(final);
    avisar(final === 'draft' ? 'Rascunho salvo' : final === 'scheduled' ? 'Post agendado' : editar ? 'Post atualizado' : 'Post publicado');
    router.refresh();
    if (!editar) router.push('/admin/posts');
  }

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); salvar(editar ? 'publicar' : 'rascunho'); }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  });

  async function adicionarTag() {
    const n = nova.trim();
    if (!n) return;
    const ja = tags.find((t) => t.name.toLowerCase() === n.toLowerCase());
    if (ja) { if (!escolhidas.includes(ja.id)) setEscolhidas([...escolhidas, ja.id]); setNova(''); return; }
    const r = await criarTag(n);
    if (!r.ok) { avisar(r.erro, true); return; }
    setTags([...tags, r.valor]); setEscolhidas([...escolhidas, r.valor.id]); setNova(''); setSujo(true);
  }

  const visiveis = useMemo(() => {
    const t = busca.trim().toLowerCase();
    const lista = t ? tags.filter((x) => x.name.toLowerCase().includes(t)) : tags;
    return [...lista].sort((a, b) => Number(escolhidas.includes(b.id)) - Number(escolhidas.includes(a.id)));
  }, [tags, busca, escolhidas]);

  const tituloGoogle = metaT || titulo || 'Título do post';
  const descGoogle = metaD || resumo || 'A descrição do seu post aparecerá aqui. Escreva algo atrativo para aumentar os cliques.';
  const botaoPublicar = editar ? 'Atualizar' : status === 'scheduled' ? 'Agendar' : 'Publicar';

  return (
    <div className="adm-form">
      <CabecaDaTela
        titulo={editar ? 'Editar Post' : 'Novo Post'}
        voltar={<Link className="adm-bt-ic" href="/admin/posts" aria-label="Voltar para Posts" title="Voltar para Posts"><Icone nome="voltar" /></Link>}
        acao={editar && post?.status === 'published'
          ? <a className="adm-link" href={`/blog/${post.slug}`} target="_blank" rel="noopener">Ver no blog<Icone nome="verBlog" tamanho={15} /></a>
          : undefined}
      />

      <div className="adm-form-grade">
        <div className="adm-form-texto">
          <section className="adm-quadro adm-folha">
            <label className="adm-so-leitor" htmlFor="adm-titulo">Título do post</label>
            <textarea id="adm-titulo" className="adm-titulo" rows={1} placeholder="Título do post" value={titulo}
              onChange={(e) => { marcar(setTitulo)(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }}
              ref={(el) => { if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; } }}
              aria-invalid={erro && !titulo.trim() ? true : undefined} />
            <p className="adm-rotulo adm-folha-rot">Conteúdo</p>
            <EditorDoPost inicial={conteudo} aoMudar={marcar(setConteudo)} />
          </section>

          <section className="adm-quadro adm-bloco">
            <div className="adm-campo">
              <label htmlFor="adm-resumo">Resumo <small>aparece na listagem</small></label>
              <textarea id="adm-resumo" className="adm-entrada" rows={3} placeholder="Breve descrição do post..." value={resumo} onChange={(e) => marcar(setResumo)(e.target.value)} />
            </div>
          </section>

          <section className="adm-quadro adm-bloco adm-seo" data-aberto={seo ? '' : undefined}>
            <button type="button" className="adm-seo-bt" onClick={() => setSeo(!seo)} aria-expanded={seo}>
              <Icone nome="busca" tamanho={18} /><span>SEO</span><Icone nome="abaixo" tamanho={18} />
            </button>
            {seo ? (
              <div className="adm-seo-corpo">
                <div className="adm-campo">
                  <label htmlFor="adm-chave">Palavra-chave principal</label>
                  <input id="adm-chave" className="adm-entrada" placeholder="Ex: rock underground brasileiro" value={chave} onChange={(e) => marcar(setChave)(e.target.value)} />
                </div>
                <div className="adm-campo">
                  <label htmlFor="adm-metat">Meta Title <small data-passou={metaT.length > 60 ? '' : undefined}>{metaT.length}/60 caracteres</small></label>
                  <input id="adm-metat" className="adm-entrada" placeholder="Título para os mecanismos de busca" value={metaT} onChange={(e) => marcar(setMetaT)(e.target.value)} />
                </div>
                <div className="adm-campo">
                  <label htmlFor="adm-metad">Meta Description <small data-passou={metaD.length > 160 ? '' : undefined}>{metaD.length}/160 caracteres</small></label>
                  <textarea id="adm-metad" className="adm-entrada" rows={3} placeholder="Descrição para os mecanismos de busca" value={metaD} onChange={(e) => marcar(setMetaD)(e.target.value)} />
                </div>
                <div className="adm-campo">
                  <label htmlFor="adm-slug">URL/Slug</label>
                  <div className="adm-prefixo">
                    <span>tribhus.com/blog/</span>
                    <input id="adm-slug" className="adm-entrada" placeholder="meu-post" value={slug}
                      onChange={(e) => { setSlugTocado(true); marcar(setSlug)(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }} />
                  </div>
                </div>
                <div className="adm-campo">
                  <span className="adm-campo-rot">Preview do Google</span>
                  <div className="adm-google" aria-label="Como o post aparece no Google">
                    <p className="adm-google-t">{tituloGoogle}</p>
                    <p className="adm-google-u">https://tribhus.com/blog/{slug}</p>
                    <p className="adm-google-d">{descGoogle}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <aside className="adm-form-lado">
          <section className="adm-quadro adm-bloco adm-publicar">
            <h2 className="adm-t2">Publicar</h2>
            <div className="adm-campo">
              <label htmlFor="adm-status">Status</label>
              <select id="adm-status" className="adm-entrada" value={status} onChange={(e) => marcar(setStatus)(e.target.value as StatusDoPost)}>
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
                <option value="scheduled">Agendado</option>
              </select>
            </div>
            {status === 'scheduled' ? (
              <div className="adm-campo adm-surge">
                <label htmlFor="adm-quando">Data de publicação</label>
                <input id="adm-quando" className="adm-entrada" type="datetime-local" value={quando} onChange={(e) => { setErro(''); marcar(setQuando)(e.target.value); }}
                  aria-invalid={erro && !quando ? true : undefined} />
              </div>
            ) : null}
            <div className="adm-chaves">
              <label className="adm-chave"><span>Destacar post</span><input type="checkbox" role="switch" checked={destaque} onChange={(e) => marcar(setDestaque)(e.target.checked)} /></label>
              <label className="adm-chave"><span>Divulgar nas redes sociais</span><input type="checkbox" role="switch" checked={redes} onChange={(e) => marcar(setRedes)(e.target.checked)} /></label>
            </div>
            {erro ? <p className="adm-erro" role="alert">{erro}</p> : null}
            <div className="adm-publicar-bts">
              <button type="button" className="adm-bt largo" onClick={() => salvar('rascunho')} disabled={!!salvando} title={editar ? undefined : 'Ctrl+S'}>
                {salvando === 'rascunho' ? <><span className="adm-giro" aria-hidden="true" />Salvando...</> : 'Salvar Rascunho'}
              </button>
              <button type="button" className="adm-bt cheio largo" onClick={() => salvar('publicar')} disabled={!!salvando} title={editar ? 'Ctrl+S' : undefined}>
                {salvando === 'publicar' ? <><span className="adm-giro" aria-hidden="true" />Salvando...</> : botaoPublicar}
              </button>
            </div>
            <p className="adm-sujo" data-sujo={sujo ? '' : undefined} aria-live="polite">{sujo ? 'Alterações não salvas' : editar ? 'Tudo salvo' : ''}</p>
          </section>

          {post?.sourceUrl ? (
            <section className="adm-quadro adm-bloco">
              <p className="adm-rotulo">Fonte original (apenas para admin)</p>
              <a className="adm-link" href={post.sourceUrl} target="_blank" rel="noopener noreferrer">{post.sourceName || 'Ver artigo original'}<Icone nome="verBlog" tamanho={15} /></a>
            </section>
          ) : null}

          <section className="adm-quadro adm-bloco">
            <h2 className="adm-t2">Imagem de Capa</h2>
            <Solta rotulo="Imagem de capa" valor={capa} aoMudar={marcar(setCapa)} proporcao="1 / 1" dica="No blog a capa aparece em quadrado" />
            <p className="adm-rotulo adm-sub-rot">Créditos da imagem</p>
            <div className="adm-campo">
              <label htmlFor="adm-cred">Nome/Fonte</label>
              <input id="adm-cred" className="adm-entrada" placeholder="Ex: Foto por Ana Lima" value={credito} onChange={(e) => marcar(setCredito)(e.target.value)} />
            </div>
            <div className="adm-campo">
              <label htmlFor="adm-cred-url">Link <small>opcional</small></label>
              <input id="adm-cred-url" className="adm-entrada" type="url" placeholder="https://instagram.com/fotografo" value={creditoUrl} onChange={(e) => marcar(setCreditoUrl)(e.target.value)} />
              <p className="adm-ajuda">Se preenchido, o crédito é clicável.</p>
            </div>
          </section>

          <section className="adm-quadro adm-bloco">
            <label className="adm-t2" htmlFor="adm-cat">Categoria</label>
            <select id="adm-cat" className="adm-entrada" value={categoria} onChange={(e) => marcar(setCategoria)(e.target.value)}>
              <option value="">Selecione uma categoria</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </section>

          <section className="adm-quadro adm-bloco adm-tags">
            <div className="adm-tags-topo">
              <h2 className="adm-t2">Tags</h2>
              {escolhidas.length ? <small>{escolhidas.length} escolhida{escolhidas.length > 1 ? 's' : ''}</small> : null}
            </div>
            <label className="adm-busca">
              <span className="adm-so-leitor">Buscar tag</span>
              <Icone nome="busca" tamanho={16} />
              <input className="adm-entrada" type="search" placeholder="Buscar tag" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </label>
            <ul className="adm-tags-lista">
              {visiveis.map((t) => {
                const sim = escolhidas.includes(t.id);
                return (
                  <li key={t.id}>
                    <button type="button" aria-pressed={sim} onClick={() => { setSujo(true); setEscolhidas(sim ? escolhidas.filter((x) => x !== t.id) : [...escolhidas, t.id]); }}>
                      {sim ? <Icone nome="check" tamanho={13} /> : null}{t.name}
                    </button>
                  </li>
                );
              })}
              {!visiveis.length ? <li className="adm-ajuda">Nenhuma tag com esse nome. Crie embaixo.</li> : null}
            </ul>
            <div className="adm-tags-nova">
              <input className="adm-entrada" placeholder="Nova tag" value={nova} aria-label="Nova tag"
                onChange={(e) => setNova(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarTag(); } }} />
              <button type="button" className="adm-bt-ic" onClick={adicionarTag} disabled={!nova.trim()} aria-label="Adicionar tag" title="Adicionar tag"><Icone nome="mais" tamanho={18} /></button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
