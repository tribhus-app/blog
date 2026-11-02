import Link from 'next/link';
import type { ReactNode } from 'react';
import { CabecaDaTela, duracao, numero } from './comum';
import { Grafico } from './Grafico';
import { Icone } from './icones';
import type { AnalyticsDoBlog, AnalyticsDoPost, Fatia, Numero, Periodo } from './tipos';

/* =========================================================================
   ANALYTICS (/admin/analytics) E O DE UM POST (/admin/analytics/:id)

   Tudo onde o ar tem: o período no alto (24h, 7 dias, 30 dias, 90 dias,
   1 ano, Tudo), os cinco números com a variação, os bots filtrados, o
   gráfico, e as listas em duas colunas (Fontes | Dispositivos e
   Navegadores; Estados | Cidades e Países), e os Posts mais lidos no pé.

   O acabamento:
   - o período é o controle segmentado, uma pílula só;
   - a variação diz para que lado foi com seta e número, sem verde e
     vermelho de bolsa: subir fica claro, cair fica âmbar;
   - o gráfico mostra o dia ao passar o mouse (Grafico.tsx);
   - cada post da tabela abre o analytics dele.
   O período mora no endereço (?periodo=7d), então o voltar do navegador
   volta ao período de antes. No ar, ele é a mesma chamada com ?period=.
   ========================================================================= */

export const PERIODOS: { p: Periodo; rotulo: string }[] = [
  { p: '24h', rotulo: '24h' }, { p: '7d', rotulo: '7 dias' }, { p: '30d', rotulo: '30 dias' },
  { p: '90d', rotulo: '90 dias' }, { p: '1y', rotulo: '1 ano' }, { p: 'all', rotulo: 'Tudo' },
];

function SeletorDePeriodo({ atual, base }: { atual: Periodo; base: string }) {
  return (
    <nav className="adm-segmento" aria-label="Período">
      {PERIODOS.map((x) => (
        <Link key={x.p} href={x.p === '30d' ? base : `${base}?periodo=${x.p}`} scroll={false}
          aria-current={x.p === atual ? 'true' : undefined}>{x.rotulo}</Link>
      ))}
    </nav>
  );
}

function Variacao({ v }: { v?: number | null }) {
  if (v === null || v === undefined) return null;
  const sobe = v >= 0;
  return (
    <span className="adm-variacao" data-cai={sobe ? undefined : ''}>
      <span aria-hidden="true">{sobe ? '↑' : '↓'}</span>
      <span className="adm-so-leitor">{sobe ? 'subiu' : 'caiu'}</span>
      {Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
    </span>
  );
}

function Medida({ rotulo, n, formato, nota }: { rotulo: string; n: Numero | number; formato?: (v: number) => string; nota?: ReactNode }) {
  const valor = typeof n === 'number' ? n : n.valor;
  return (
    <div className="adm-quadro adm-medida">
      <p className="adm-rotulo">{rotulo}</p>
      <b>{formato ? formato(valor) : numero(valor)}</b>
      {typeof n === 'number' ? null : <Variacao v={n.variacao} />}
      {nota ? <p className="adm-medida-nota">{nota}</p> : null}
    </div>
  );
}

function Lista({ titulo, fatias, vazio = 'Sem dados no período' }: { titulo: string; fatias: Fatia[]; vazio?: string }) {
  return (
    <section className="adm-quadro adm-bloco">
      <h2 className="adm-t2">{titulo}</h2>
      {fatias.length ? (
        <ul className="adm-barras">
          {fatias.map((f) => (
            <li key={f.nome}>
              <div className="adm-barras-l"><span>{f.nome}</span><b>{numero(f.total)}<small>{f.pct}%</small></b></div>
              <i style={{ ['--p' as string]: f.pct / 100 }} />
            </li>
          ))}
        </ul>
      ) : <p className="adm-ajuda">{vazio}</p>}
    </section>
  );
}

const pct = (v: number) => `${v}%`;

export function Analytics({ dados, periodo }: { dados: AnalyticsDoBlog; periodo: Periodo }) {
  const g = dados.geral;
  const semVisita = !g.views.valor;
  return (
    <div className="adm-analytics">
      <CabecaDaTela titulo="Analytics" sub="Audiência real do blog: tráfego, fontes e engajamento (bots excluídos)"
        acao={<SeletorDePeriodo atual={periodo} base="/admin/analytics" />} />

      {semVisita ? (
        <div className="adm-quadro adm-vazio">
          <Icone nome="analytics" tamanho={28} />
          <b>Ainda não há visitas registradas neste período</b>
          <span>Escolha um período maior no alto da página.</span>
        </div>
      ) : (
        <>
          <div className="adm-medidas">
            <Medida rotulo="Visualizações" n={g.views} />
            <Medida rotulo="Leitores de verdade" n={g.leitores} nota="Quem ficou na página e leu. O resto abriu e saiu na hora." />
            <Medida rotulo="Visitantes únicos" n={g.unicos} />
            <Medida rotulo="Tempo médio de leitura" n={g.tempoMedio} formato={duracao} />
            <Medida rotulo="Scroll médio" n={g.scrollMedio} formato={pct} />
          </div>
          <p className="adm-bots"><Icone nome="esconder" tamanho={15} />{numero(g.bots)} acessos de bots filtrados</p>

          <section className="adm-quadro adm-bloco adm-bloco-grafico">
            <h2 className="adm-t2">Tráfego ao longo do tempo</h2>
            <Grafico pontos={dados.tempo} />
          </section>

          <div className="adm-analytics-grade">
            <Lista titulo="Fontes de tráfego" fatias={dados.fontes} />
            <div className="adm-analytics-pilha">
              <Lista titulo="Dispositivos" fatias={dados.aparelhos} />
              <Lista titulo="Navegadores" fatias={dados.navegadores} />
            </div>
            <Lista titulo="Estados / Regiões" fatias={dados.estados} />
            <div className="adm-analytics-pilha">
              <Lista titulo="Cidades (top 20)" fatias={dados.cidades.slice(0, 20)} />
              <Lista titulo="Países" fatias={dados.paises} />
            </div>
          </div>

          <section className="adm-quadro">
            <div className="adm-quadro-topo"><h2 className="adm-t2">Posts mais lidos</h2></div>
            <div className="adm-tabela-rolagem">
              <table className="adm-tabela adm-tabela-lidos">
                <thead>
                  <tr><th scope="col">Post</th><th scope="col" className="num">Views</th><th scope="col" className="num">Únicos</th><th scope="col" className="num">Tempo méd.</th><th scope="col" className="num">Scroll méd.</th></tr>
                </thead>
                <tbody>
                  {dados.maisLidos.map((p, k) => (
                    <tr key={p.id}>
                      <td>
                        <Link className="adm-lido" href={`/admin/analytics/${p.id}${periodo === '30d' ? '' : `?periodo=${periodo}`}`}>
                          <span className="adm-lido-n">{k + 1}</span><b>{p.title}</b><Icone nome="seta" tamanho={16} />
                        </Link>
                      </td>
                      <td className="num">{numero(p.views)}</td>
                      <td className="num">{numero(p.unicos)}</td>
                      <td className="num">{duracao(p.tempoMedio)}</td>
                      <td className="num">{p.scrollMedio}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export function AnalyticsDoPostTela({ dados, periodo }: { dados: AnalyticsDoPost; periodo: Periodo }) {
  return (
    <div className="adm-analytics">
      <CabecaDaTela
        titulo={<span className="adm-cabeca-post">{dados.title}</span>}
        sub={<a className="adm-link adm-caminho" href={`/blog/${dados.slug}`} target="_blank" rel="noopener">/blog/{dados.slug}<Icone nome="verBlog" tamanho={14} /></a>}
        voltar={<Link className="adm-bt-ic" href={`/admin/analytics${periodo === '30d' ? '' : `?periodo=${periodo}`}`} aria-label="Voltar para Analytics" title="Voltar"><Icone nome="voltar" /></Link>}
        acao={<SeletorDePeriodo atual={periodo} base={`/admin/analytics/${dados.id}`} />}
      />
      <div className="adm-medidas adm-medidas-4">
        <Medida rotulo="Visualizações (período)" n={dados.views} nota={<>Total histórico: <b>{numero(dados.totalHistorico)}</b></>} />
        <Medida rotulo="Visitantes únicos" n={dados.unicos} />
        <Medida rotulo="Tempo médio de leitura" n={dados.tempoMedio} formato={duracao} />
        <Medida rotulo="Scroll médio" n={dados.scrollMedio} formato={pct} />
      </div>
      <section className="adm-quadro adm-bloco adm-bloco-grafico">
        <h2 className="adm-t2">Views ao longo do tempo</h2>
        {/* a API não manda únicos por dia de um post: o gráfico fica só com Views */}
        <Grafico pontos={dados.tempo} rotuloUnicos={null} />
      </section>
      <div className="adm-analytics-grade">
        <Lista titulo="Fontes de tráfego" fatias={dados.fontes} />
        <Lista titulo="Dispositivos" fatias={dados.aparelhos} />
      </div>
    </div>
  );
}
