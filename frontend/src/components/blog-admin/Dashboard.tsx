import Link from 'next/link';
import { Icone, type NomeDoIcone } from './icones';
import { CabecaDaTela, Status, data, numero } from './comum';
import type { Estatisticas, PostDoPainel } from './tipos';

/* =========================================================================
   O DASHBOARD (/admin)

   O mesmo desenho do ar, peça por peça: "Dashboard" e "Novo Post" em cima;
   os quatro números na mesma ordem; Posts Recentes à esquerda com "Ver
   todos"; Ações Rápidas à direita, com os mesmos quatro atalhos na mesma
   posição. O número virou o cartaz da casa e os ícones voltaram a ser da
   cor do texto. Rascunho acende em âmbar quando tem algum, porque é o
   número que pede alguma coisa de quem abre o painel.
   ========================================================================= */

const NUMEROS: { chave: keyof Estatisticas; rotulo: string; icone: NomeDoIcone }[] = [
  { chave: 'totalPosts', rotulo: 'Total de Posts', icone: 'posts' },
  { chave: 'publishedPosts', rotulo: 'Publicados', icone: 'check' },
  { chave: 'draftPosts', rotulo: 'Rascunhos', icone: 'editar' },
  { chave: 'totalViews', rotulo: 'Visualizações', icone: 'ver' },
];

const ATALHOS: { href: string; rotulo: string; icone: NomeDoIcone; fora?: boolean }[] = [
  { href: '/admin/posts/new', rotulo: 'Novo Post', icone: 'mais' },
  { href: '/admin/categories', rotulo: 'Categorias', icone: 'categorias' },
  { href: '/admin/authors', rotulo: 'Autores', icone: 'autores' },
  { href: '/blog', rotulo: 'Ver Blog', icone: 'verBlog', fora: true },
];

export function Dashboard({ numeros, recentes }: { numeros: Estatisticas; recentes: PostDoPainel[] }) {
  return (
    <div className="adm-dash">
      <CabecaDaTela
        titulo="Dashboard"
        acao={<Link className="adm-bt cheio" href="/admin/posts/new"><Icone nome="mais" tamanho={18} />Novo Post</Link>}
      />

      <ul className="adm-numeros">
        {NUMEROS.map((n) => (
          <li key={n.chave} className="adm-quadro adm-numero" data-atencao={n.chave === 'draftPosts' && numeros.draftPosts > 0 ? '' : undefined}>
            <p className="adm-rotulo">{n.rotulo}</p>
            <span className="adm-numero-ic"><Icone nome={n.icone} tamanho={18} /></span>
            <b>{numero(numeros[n.chave])}</b>
          </li>
        ))}
      </ul>

      <div className="adm-dash-grade">
        <section className="adm-quadro" aria-labelledby="adm-recentes">
          <div className="adm-quadro-topo">
            <h2 className="adm-t2" id="adm-recentes">Posts Recentes</h2>
            <Link className="adm-link" href="/admin/posts">Ver todos<Icone nome="seta" tamanho={15} /></Link>
          </div>
          {recentes.length ? (
            <ul className="adm-recentes">
              {recentes.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/posts/${p.id}/edit`}>
                    <span className="adm-miniatura">{p.coverImage ? <img src={p.coverImage} alt="" width={48} height={48} loading="lazy" /> : null}</span>
                    <span className="adm-recentes-t">
                      <b>{p.title}</b>
                      <small>{data(p.publishedAt ?? p.scheduledAt ?? p.createdAt)}</small>
                    </span>
                    <Status s={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="adm-vazio">
              <b>Nenhum post ainda</b>
              <Link className="adm-bt cheio" href="/admin/posts/new"><Icone nome="mais" tamanho={18} />Criar primeiro post</Link>
            </div>
          )}
        </section>

        <section className="adm-quadro" aria-labelledby="adm-atalhos">
          <div className="adm-quadro-topo"><h2 className="adm-t2" id="adm-atalhos">Ações Rápidas</h2></div>
          <ul className="adm-atalhos">
            {ATALHOS.map((a) => (
              <li key={a.href}>
                {a.fora ? (
                  /* fora do painel: <a> comum, com o /blog escrito (o <Link> poria outro) */
                  <a href={a.href} target="_blank" rel="noopener">
                    <Icone nome={a.icone} tamanho={26} />
                    <span>{a.rotulo}</span>
                  </a>
                ) : (
                  <Link href={a.href} data-primeiro={a.icone === 'mais' ? '' : undefined}>
                    <Icone nome={a.icone} tamanho={26} />
                    <span>{a.rotulo}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
