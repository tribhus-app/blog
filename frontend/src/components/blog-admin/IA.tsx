'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { atualizarNoticias, desligarScheduler, gerarAgora, ligarScheduler } from './acoes';
import { CabecaDaTela } from './comum';
import { Icone } from './icones';
import { avisar } from './pecas';
import type { CategoriaDoPainel, EstadoDaIA, NoticiaDisponivel } from './tipos';

/* =========================================================================
   A IA (/admin/ai)

   A ordem do ar: o modo de busca, o Calendário Editorial (um tema por
   dia, hoje marcado), o Scheduler Automático e a Geração Manual lado a
   lado, o Preview das notícias disponíveis e as Fontes de Notícias.

   O que mudou:
   - o scheduler mostra o estado no alto do quadro, em palavra e em luz;
     o botão Iniciar/Parar continua embaixo, onde a mão já vai;
   - "Gerar Artigos Agora" diz o que gasta (umas 30 das 1.000 buscas do
     mês) antes de clicar, e enquanto gera mostra a etapa (as mesmas
     mensagens do ar, trocando a cada 8 s) numa barra que anda;
   - no fim, "3 artigos gerados" com o atalho Ver Rascunhos.
   Nada aqui roda sozinho: no exemplo os três botões só fingem.

   NO AR (31/10/2026):
   - o modo de busca e os alertas vêm de /ai/scheduler/status (com RSS ou
     sem a chave do Claude, a linha avisa, como o painel antigo avisava);
   - as notícias do Preview chegam pelo navegador ao abrir a tela (a API
     lê os RSS na hora e pode demorar), e Atualizar busca de novo;
   - quando todas as notícias já viraram artigo, a API manda uma frase, e
     ela aparece no lugar de "0 artigos gerados".
   ========================================================================= */

const ETAPAS = [
  'Iniciando busca com Tavily...', 'Buscando notícias na internet (12 buscas)...', 'Analisando e rankeando resultados...',
  'Selecionando as 3 melhores notícias...', 'Enriquecendo notícia 1/3 com fontes adicionais...', 'Enriquecendo notícia 2/3 com fontes adicionais...',
  'Enriquecendo notícia 3/3 com fontes adicionais...', 'Enviando para o Claude...', 'Gerando artigo 1/3...', 'Gerando artigo 2/3...',
  'Gerando artigo 3/3...', 'Salvando rascunhos...',
];

const PASSOS = [
  'O Tavily busca notícias na internet (12 buscas).',
  'Seleciona as 3 melhores notícias.',
  'Enriquece cada uma com 6 buscas a mais.',
  'O Claude escreve os artigos com várias fontes.',
  'Salva como rascunho, com a checagem contra invenção ligada.',
];

export function IA({ estado: inicial, calendario, categorias, noticias: iniciais, hoje }: {
  estado: EstadoDaIA;
  calendario: { dia: string; tema: string }[];
  categorias: CategoriaDoPainel[];
  /** null: a tela busca sozinha ao abrir. */
  noticias: NoticiaDisponivel[] | null;
  /** O índice do dia da semana (0 = domingo). */
  hoje: number;
}) {
  const [estado, setEstado] = useState(inicial);
  const [mudando, setMudando] = useState(false);
  const [erroSch, setErroSch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [gerando, setGerando] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [feito, setFeito] = useState<{ gerados: number; mensagem?: string } | null>(null);
  const [erroGer, setErroGer] = useState('');
  const [noticias, setNoticias] = useState<NoticiaDisponivel[]>(iniciais ?? []);
  const [atualizando, setAtualizando] = useState(iniciais === null);
  const [erroNot, setErroNot] = useState('');

  useEffect(() => { if (iniciais === null) atualizar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!gerando) return;
    const t = setInterval(() => setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1)), 8000);
    return () => clearInterval(t);
  }, [gerando]);

  async function alternar() {
    setMudando(true); setErroSch('');
    const r = estado.ligado ? await desligarScheduler(estado) : await ligarScheduler(estado);
    setMudando(false);
    if (!r.ok) { setErroSch(r.erro); return; }
    setEstado(r.valor);
    avisar(r.valor.ligado ? 'Scheduler ligado' : 'Scheduler desligado');
  }

  async function gerar() {
    setGerando(true); setEtapa(0); setFeito(null); setErroGer('');
    const r = await gerarAgora(categoria || null);
    setGerando(false);
    if (!r.ok) { setErroGer(r.erro); return; }
    setFeito(r.valor);
  }

  async function atualizar() {
    setAtualizando(true); setErroNot('');
    const r = await atualizarNoticias();
    setAtualizando(false);
    if (r.ok) setNoticias(r.valor); else setErroNot(r.erro);
  }

  return (
    <div className="adm-ia">
      <CabecaDaTela titulo="Geração de Artigos com IA" sub="Controle a geração automática de artigos usando o Claude" />
      <p className="adm-ia-modo"><Icone nome="busca" tamanho={16} />{estado.modo === 'rss'
        ? <span>Modo de busca: <b>RSS</b>, básico. Configure a TAVILY_API_KEY para a busca enriquecida</span>
        : <span>Modo de busca: <b>Tavily</b>, busca enriquecida e checagem contra invenção</span>}</p>
      {estado.claudeConfigurado === false ? (
        <p className="adm-erro" role="alert">A chave CLAUDE_API_KEY não está configurada no servidor: a geração de artigos não roda.</p>
      ) : null}
      {estado.alertas?.length ? (
        <ul className="adm-erro" role="alert">{estado.alertas.map((a) => <li key={a}>{a}</li>)}</ul>
      ) : null}

      <section className="adm-quadro adm-bloco">
        <h2 className="adm-t2">Calendário Editorial</h2>
        <ol className="adm-calendario">
          {calendario.map((d, i) => (
            <li key={d.dia} aria-current={i === hoje ? 'date' : undefined}>
              <span className="adm-rotulo">{d.dia}</span>
              <b>{d.tema}</b>
              {i === hoje ? <small>Hoje</small> : null}
            </li>
          ))}
        </ol>
      </section>

      <div className="adm-ia-grade">
        <section className="adm-quadro adm-bloco adm-scheduler">
          <div className="adm-ia-topo">
            <h2 className="adm-t2">Scheduler Automático</h2>
            <span className="adm-ligado" data-ligado={estado.ligado ? '' : undefined}>{estado.ligado ? 'Ligado' : 'Desligado'}</span>
          </div>
          <dl className="adm-dados">
            <div><dt>Horário de execução</dt><dd>Todo dia às {estado.horario}</dd></div>
            <div><dt>Próxima execução</dt><dd>{estado.proxima ?? 'Nenhuma'}</dd></div>
            <div><dt>Última execução</dt><dd>{estado.ultima ?? 'Nunca'}</dd></div>
            <div><dt>Artigos por execução</dt><dd>{estado.porExecucao}</dd></div>
          </dl>
          {erroSch ? <p className="adm-erro" role="alert">{erroSch}</p> : null}
          <button type="button" className={`adm-bt largo${estado.ligado ? '' : ' claro'}`} onClick={alternar} disabled={mudando}>
            {mudando ? <><span className="adm-giro" aria-hidden="true" />{estado.ligado ? 'Parando...' : 'Iniciando...'}</>
              : estado.ligado ? 'Parar Scheduler' : 'Iniciar Scheduler'}
          </button>
        </section>

        <section className="adm-quadro adm-bloco adm-geracao">
          <div>
            <h2 className="adm-t2">Geração Manual</h2>
            <p className="adm-sub">Escolha uma categoria ou use a categoria do dia.</p>
          </div>
          <div className="adm-campo">
            <label htmlFor="adm-ia-cat">Categoria</label>
            <select id="adm-ia-cat" className="adm-entrada" value={categoria} onChange={(e) => setCategoria(e.target.value)} disabled={gerando}>
              <option value="">Usar a categoria do dia ({estado.hoje})</option>
              {categorias.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div className="adm-como">
            <p className="adm-rotulo">Como funciona</p>
            <ol>{PASSOS.map((p) => <li key={p}>{p}</li>)}</ol>
            <p className="adm-ajuda">Leva de 2 a 3 minutos e gasta umas 30 das 1.000 buscas do mês.</p>
          </div>
          {gerando ? (
            <div className="adm-gerando" role="status" aria-live="polite">
              <span>{ETAPAS[etapa]}</span>
              <i style={{ ['--p' as string]: (etapa + 1) / ETAPAS.length }} />
            </div>
          ) : null}
          {feito !== null && feito.gerados > 0 ? (
            <div className="adm-feito" role="status">
              <Icone nome="check" tamanho={18} />
              <span>{feito.gerados} artigo{feito.gerados === 1 ? '' : 's'} gerado{feito.gerados === 1 ? '' : 's'}, salvo{feito.gerados === 1 ? '' : 's'} como rascunho.</span>
              <Link className="adm-link" href="/admin/posts?status=draft">Ver Rascunhos<Icone nome="seta" tamanho={15} /></Link>
            </div>
          ) : null}
          {feito !== null && !feito.gerados ? (
            <div className="adm-feito" role="status">
              <Icone nome="check" tamanho={18} />
              <span>{feito.mensagem}</span>
            </div>
          ) : null}
          {erroGer ? <p className="adm-erro" role="alert">{erroGer}</p> : null}
          <button type="button" className="adm-bt cheio largo" onClick={gerar} disabled={gerando}>
            {gerando ? <><span className="adm-giro" aria-hidden="true" />Gerando artigos...</> : <><Icone nome="raio" tamanho={18} />Gerar Artigos Agora</>}
          </button>
        </section>
      </div>

      <section className="adm-quadro">
        <div className="adm-quadro-topo">
          <h2 className="adm-t2">Preview: notícias disponíveis</h2>
          <button type="button" className="adm-bt" onClick={atualizar} disabled={atualizando}>
            {atualizando ? <span className="adm-giro" aria-hidden="true" /> : <Icone nome="atualizar" tamanho={17} />}Atualizar
          </button>
        </div>
        {noticias.length ? (
          <ul className="adm-noticias" aria-busy={atualizando}>
            {noticias.map((n) => (
              <li key={n.titulo}>
                <b>{n.titulo}</b>
                <span>{n.fonte} · {n.data}{n.comImagem ? <span className="adm-selo">Com imagem</span> : null}</span>
              </li>
            ))}
          </ul>
        ) : erroNot ? <p className="adm-erro" role="alert">{erroNot}</p>
          : <p className="adm-vazio">{atualizando ? 'Buscando as notícias...' : 'Nenhuma notícia disponível no momento'}</p>}
      </section>

      <section className="adm-quadro adm-bloco">
        <h2 className="adm-t2">Fontes de Notícias</h2>
        <div className="adm-fontes">
          <div>
            <p className="adm-rotulo">Tavily, busca global</p>
            <ul>
              <li>Busca em toda a internet</li>
              <li>Cobertura global (Brasil, EUA, Europa, Ásia)</li>
              <li>Várias fontes por artigo</li>
              <li>Checagem contra invenção ligada</li>
            </ul>
          </div>
          <div>
            <p className="adm-rotulo">Buscas por geração</p>
            <ul>
              <li>12 buscas de descoberta</li>
              <li>18 buscas de enriquecimento</li>
              <li>Umas 30 buscas por geração</li>
              <li>1.000 buscas por mês, de graça</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
