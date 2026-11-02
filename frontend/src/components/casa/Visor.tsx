'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { VideoDoVisor } from './VideoDoVisor';
import { LinksDoPost, comLinks, separarLinks } from './LinksDoPost';
import { comentariosDoPost, comentarNoPost, pedirLoginNoVisor, type ComentarioDoVisor } from './acoesDoVisor';

/* =========================================================================
   O VISOR DA CASA: a porta da Tribhus para tudo o que é de ver

   Uma peça só para toda tela que abre foto, take, vídeo ou post: o Radar, a
   página da banda, o Palco, o perfil. Cada página entrega a LISTA dela e o
   visor faz o resto, sempre igual.

   O PROPÓSITO MANDA NO DESENHO. Na Tribhus, a foto, o take e o post são de
   uma banda, e o visor existe para levar quem viu até ela. Por isso:
   - A BANDA É A AÇÃO PRINCIPAL: o cartão dela fica sempre à vista no pé da
     ficha, com "Ver a banda" em laranja. Abrir a página do item e
     compartilhar ficam discretos;
   - nada se repete: o tipo aparece uma vez, o título só quando não é o
     próprio nome da banda;
   - o post vem com a conversa (os comentários que o site já tem).

   O CORPO:
   - a mídia e a ficha são UMA PEÇA, centralizada, a ficha grudada na mídia
     (e não presa na borda da tela);
   - o vídeo usa O PLAYER DA CASA (`VideoDoVisor`): controles próprios, o
     sulco como barra de tempo, a mesma língua da página de música;
   - no pé, A FITA DA GALERIA: tudo o que a página abriu, em miniatura, com o
     atual aceso. Dá para ver de onde veio e pular para qualquer um;
   - nada de tela preta: a miniatura (que já está na memória) aparece na
     hora, e a imagem cheia entra por cima quando chega.

   A ABERTURA CONVERSA COM A PÁGINA: a mídia NASCE DE ONDE A PESSOA CLICOU
   (o quadrado do mosaico, a foto da faixa) e volta para lá ao fechar.

   NO CELULAR, TELA CHEIA: a mídia ocupa tudo, a ficha fica por cima no pé
   (sobe para ler o resto e a conversa), deslizar para os lados passa, e
   ARRASTAR PARA BAIXO FECHA, o gesto que todo mundo já faz.

   O ENDEREÇO É O DA COISA (`useVisor`): abrir troca a URL para a página do
   item, passar troca de novo, fechar volta; o "voltar" do navegador fecha.

   Acessível: diálogo modal (foco dentro, Esc fecha, o foco volta para quem
   abriu), a posição na galeria é anunciada, e quem pede menos movimento vê
   tudo sem voo nem deslize. Só `transform` e `opacity` animam.
   ========================================================================= */

export interface ItemDoVisor {
  id: string;
  tipo: 'foto' | 'take' | 'video' | 'post';
  /** A linha de cima da ficha. Sem ela, o nome do tipo ("Take", "Foto"). */
  rotulo?: string | null;
  titulo: string;
  /** O título é frase (o post), não nome: vai em letra de texto. */
  tituloFrase?: boolean;
  /** A página do item (/takes/292). Sem ela, o endereço não muda. */
  href?: string | null;
  imagem?: string | null;
  /** A imagem pequena que a página já mostrou: aparece na hora. */
  miniatura?: string | null;
  /** O arquivo de vídeo (mp4, ou HLS pelo player do site). */
  video?: string | null;
  /** Ou o vídeo do YouTube, pelo endereço que a banda colou. */
  youtube?: string | null;
  /** Segundos, para a miniatura da fita. */
  duracao?: number | null;
  /** A legenda da foto, o texto do post. */
  texto?: string | null;
  /** O id do post no site, para os comentários. Só no post. */
  postId?: number | null;
  /** Quem fez. `tipo` decide o botão: "Ver a banda" ou "Ver perfil". */
  autor?: { nome: string; href?: string | null; fotoUrl?: string | null; cidade?: string | null; tipo?: 'banda' | 'usuario' | 'empresa' } | null;
}

export interface TextosDoVisor {
  fechar: string; anterior: string; proxima: string; abrir: string;
  verBanda: string; verPerfil: string; compartilhar: string;
  galeria: string; posicao: (n: number, total: number) => string;
  tocar: string; pausar: string; somLigar: string; somDesligar: string; telaCheia: string; tempo: string;
  comentarios: string; comentar: string; enviar: string; primeiro: string; entrarParaComentar: string;
  tipos: Record<ItemDoVisor['tipo'], string>;
}

export const VISOR_PT: TextosDoVisor = {
  fechar: 'Fechar', anterior: 'Anterior', proxima: 'Próxima', abrir: 'Abrir a página',
  verBanda: 'Ver a banda', verPerfil: 'Ver perfil', compartilhar: 'Compartilhar',
  galeria: 'Tudo o que está aberto', posicao: (n, total) => `${n} de ${total}`,
  tocar: 'Tocar', pausar: 'Pausar', somLigar: 'Ligar o som', somDesligar: 'Tirar o som', telaCheia: 'Tela cheia', tempo: 'Posição no vídeo',
  comentarios: 'Comentários', comentar: 'Escreva um comentário…', enviar: 'Enviar',
  primeiro: 'Seja o primeiro a comentar.', entrarParaComentar: 'Entre para comentar',
  tipos: { foto: 'Foto', take: 'Take', video: 'Vídeo', post: 'Post' },
};
export const VISOR_EN: TextosDoVisor = {
  fechar: 'Close', anterior: 'Previous', proxima: 'Next', abrir: 'Open the page',
  verBanda: 'See the band', verPerfil: 'See profile', compartilhar: 'Share',
  galeria: 'Everything open', posicao: (n, total) => `${n} of ${total}`,
  tocar: 'Play', pausar: 'Pause', somLigar: 'Unmute', somDesligar: 'Mute', telaCheia: 'Full screen', tempo: 'Position in the video',
  comentarios: 'Comments', comentar: 'Write a comment…', enviar: 'Send',
  primeiro: 'Be the first to comment.', entrarParaComentar: 'Sign in to comment',
  tipos: { foto: 'Photo', take: 'Take', video: 'Video', post: 'Post' },
};
export const VISOR_ES: TextosDoVisor = {
  fechar: 'Cerrar', anterior: 'Anterior', proxima: 'Siguiente', abrir: 'Abrir la página',
  verBanda: 'Ver la banda', verPerfil: 'Ver perfil', compartilhar: 'Compartir',
  galeria: 'Todo lo abierto', posicao: (n, total) => `${n} de ${total}`,
  tocar: 'Tocar', pausar: 'Pausar', somLigar: 'Activar el sonido', somDesligar: 'Silenciar', telaCheia: 'Pantalla completa', tempo: 'Posición en el video',
  comentarios: 'Comentarios', comentar: 'Escribe un comentario…', enviar: 'Enviar',
  primeiro: 'Sé el primero en comentar.', entrarParaComentar: 'Entra para comentar',
  tipos: { foto: 'Foto', take: 'Take', video: 'Video', post: 'Publicación' },
};

/** O id do vídeo num endereço do YouTube (watch, youtu.be, shorts, embed). */
export function idDoYoutube(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** O post só de texto escolhe a letra pelo tamanho: o recado curto sai como
 *  grito de cartaz, o médio como hoje, o longo em letra de leitura. A mesma
 *  regra serve ao visor, à página do post e à prévia do Amplificador. */
/** O quadrinho de texto da fita: o começo do texto, sem os endereços; o
 *  post que era só o link leva o destino, no papel da etiqueta */
function FitaTexto({ v }: { v: ItemDoVisor }) {
  const { texto, links } = separarLinks(v.texto);
  const link = texto ? null : links[0];
  return (
    <span className="vs-fita-texto" data-papel={link ? '' : undefined} aria-hidden="true">
      {(link ? link.acao : texto || v.titulo || '').slice(0, 48)}
    </span>
  );
}

export function tamanhoDoTexto(texto: string): 'curto' | 'medio' | 'longo' {
  const n = texto.trim().length;
  return n <= 90 ? 'curto' : n <= 280 ? 'medio' : 'longo';
}

const mmss = (s: number) =>`${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const igual = (a?: string | null, b?: string | null) => !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
const calmo = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------ a imagem */
/* a miniatura que a página já mostrou aparece na hora; a cheia entra por
   cima quando chega */
/* O ZOOM: dois cliques (ou dois toques) aproximam no ponto, e o mouse
   passeia pela foto aproximada; dois cliques de novo voltam. Foto de show
   tem detalhe que só aparece de perto. */
function ImagemDoVisor({ src, mini, alt }: { src: string; mini?: string | null; alt: string }) {
  const [pronta, setPronta] = useState(false);
  const [perto, setPerto] = useState<{ x: number; y: number } | null>(null);
  const ultimo = useRef(0);
  const ponto = (e: React.PointerEvent | React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  };
  const alternar = (e: React.PointerEvent | React.MouseEvent) => {
    const p = ponto(e);
    setPerto((v) => (v ? null : p));
  };
  return (
    <span className="vs-img" data-pronta={pronta ? '' : undefined} data-perto={perto ? '' : undefined}
          onDoubleClick={alternar}
          onPointerUp={(e) => {
            if (e.pointerType === 'mouse') return;
            const agora = Date.now();
            if (agora - ultimo.current < 300) { alternar(e); ultimo.current = 0; } else ultimo.current = agora;
          }}
          onPointerMove={(e) => { if (perto && e.pointerType === 'mouse') setPerto(ponto(e)); }}>
      {mini && mini !== src ? <img className="vs-midia vs-img-mini" src={mini} alt="" aria-hidden="true" /> : null}
      <img className="vs-midia vs-img-cheia" src={src} alt={alt} onLoad={() => setPronta(true)} draggable={false}
           style={perto ? { transformOrigin: `${perto.x}% ${perto.y}%` } : undefined}
           ref={(el) => { if (el?.complete && el.naturalWidth) setPronta(true); }} />
    </span>
  );
}

/* ------------------------------------------------------------ a conversa */
function Conversa({ postId, logado, t, nivel = 'h3' }: { postId: number; logado: boolean; t: TextosDoVisor; nivel?: 'h2' | 'h3' }) {
  const Titulo = nivel;
  const [lista, setLista] = useState<ComentarioDoVisor[] | null>(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  useEffect(() => {
    let vivo = true;
    setLista(null);
    comentariosDoPost(postId).then((l) => { if (vivo) setLista(l); }).catch(() => { if (vivo) setLista([]); });
    return () => { vivo = false; };
  }, [postId]);
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = texto.trim();
    if (!v || enviando) return;
    setEnviando(true);
    const novo = await comentarNoPost(postId, v);
    setEnviando(false);
    if (novo) { setLista((l) => [...(l ?? []), novo]); setTexto(''); }
  };
  return (
    <section className="vs-conversa" aria-label={t.comentarios}>
      <Titulo>{t.comentarios}</Titulo>
      {lista === null ? (
        <p className="vs-conversa-espera" aria-hidden="true"><i></i><i></i></p>
      ) : lista.length === 0 ? (
        <p className="vs-conversa-vazia">{t.primeiro}</p>
      ) : (
        <ul>
          {lista.map((c) => (
            <li key={c.id}>
              {c.autor.fotoUrl ? <img src={c.autor.fotoUrl} alt="" /> : <span aria-hidden="true">{c.autor.nome.slice(0, 1)}</span>}
              <p>{c.autor.href ? <a href={c.autor.href}>{c.autor.nome}</a> : <strong>{c.autor.nome}</strong>} {c.texto}</p>
            </li>
          ))}
        </ul>
      )}
      {logado ? (
        <form className="vs-comentar" onSubmit={enviar}>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={t.comentar} aria-label={t.comentar} maxLength={500} />
          <button type="submit" disabled={!texto.trim() || enviando}>{t.enviar}</button>
        </form>
      ) : (
        <button type="button" className="vs-entrar" onClick={pedirLoginNoVisor}>{t.entrarParaComentar}</button>
      )}
    </section>
  );
}

/* ------------------------------------------------------------ a peça */
/* A MÍDIA E A FICHA, a peça do visor. Vive no visor (por cima da página) e
   na PÁGINA DA COISA (/foto, /takes, /video, /postagem), que é o visor
   parado: a mesma peça, sem a galeria em volta. `naPagina` faz o título
   ser o h1 e tira o "Abrir a página" (já está nela). */
export function PecaDoVisor({ x, t, logado = false, prepararVideo, pecaRef, quadroRef, direcao, naPagina = false, tituloId = 'vs-tit' }: {
  x: ItemDoVisor;
  t: TextosDoVisor;
  logado?: boolean;
  prepararVideo?: (video: HTMLVideoElement, src: string) => void | (() => void);
  pecaRef?: RefObject<HTMLDivElement | null>;
  quadroRef?: RefObject<HTMLElement | null>;
  direcao?: 'proxima' | 'anterior' | null;
  naPagina?: boolean;
  /** O id do título (o visor aberto sobre a página usa o `vs-tit`). */
  tituloId?: string;
}) {
  const rotulo = x.rotulo || t.tipos[x.tipo];
  const yt = idDoYoutube(x.youtube);
  /* as linhas que são só link saem do texto e viram o cartão de links; o
     vídeo do YouTube que já está embutido não entra de novo */
  const { texto, links } = separarLinks(x.texto, (u) => !!yt && idDoYoutube(u) === yt);
  const soTexto = !x.video && !yt && !x.imagem && !!x.texto;
  /* o post que era só o link: o cartão no lugar do texto */
  const soLinks = soTexto && !texto && links.length > 0;
  const mostraTitulo = !!x.titulo && x.tipo !== 'post' && !igual(x.titulo, x.autor?.nome);
  /* a legenda que é igual ao título não aparece duas vezes */
  const legenda = texto && !soTexto && !igual(texto, x.titulo) ? texto : null;
  const linksAntes = !soLinks && (legenda?.length ?? 0) > 280;
  const banda = x.autor?.tipo !== 'usuario' && x.autor?.tipo !== 'empresa';
  const Titulo = naPagina ? 'h1' : 'h2';
  /* no post, o primeiro é quem falou: a banda vem logo embaixo do rótulo,
     a conversa depois, e no pé fica só a ação (ver a banda, compartilhar) */
  const quemEmCima = x.tipo === 'post' && !!x.autor;
  const quem = x.autor ? (
    <div className="vs-banda-quem">
      {x.autor.fotoUrl ? <img src={x.autor.fotoUrl} alt="" /> : <span aria-hidden="true">{x.autor.nome.slice(0, 1)}</span>}
      <p><strong>{x.autor.nome}</strong>{x.autor.cidade ? <small>{x.autor.cidade}</small> : null}</p>
    </div>
  ) : null;
  return (
    <div className="vs-peca" ref={pecaRef as RefObject<HTMLDivElement>} data-direcao={direcao ?? undefined}>
      <figure className="vs-quadro" ref={quadroRef as RefObject<HTMLElement>} data-so-texto={soTexto ? '' : undefined}>
        {yt ? (
          <iframe className="vs-midia vs-yt" src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=${naPagina ? 0 : 1}&rel=0`}
                  title={x.titulo} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        ) : x.video ? (
          <VideoDoVisor src={x.video} poster={x.imagem ?? x.miniatura ?? null} emPe={x.tipo === 'take'} textos={t} preparar={prepararVideo} naPagina={naPagina} />
        ) : x.imagem ? (
          <ImagemDoVisor src={x.imagem} mini={x.miniatura} alt={texto ?? (mostraTitulo ? x.titulo : `${rotulo}, ${x.autor?.nome ?? ''}`)} />
        ) : soLinks ? (
          <LinksDoPost links={links} grande />
        ) : (
          <blockquote className="vs-texto" data-tam={tamanhoDoTexto(texto ?? '')}><p>{comLinks(texto ?? '')}</p></blockquote>
        )}
      </figure>

      <div className="vs-ficha">
        <div className="vs-ficha-rola">
          <p className="vs-tipo">
            <span>{rotulo}</span>
            {x.duracao ? <span>{mmss(x.duracao)}</span> : null}
          </p>
          {quemEmCima ? quem : null}
          <Titulo id={tituloId} className={mostraTitulo ? 'vs-titulo' : 'so-leitor'} data-frase={x.tituloFrase ? '' : undefined}>
            {mostraTitulo ? x.titulo : `${rotulo}, ${x.autor?.nome ?? ''}`}
          </Titulo>
          {/* com texto longo, os links sobem para logo abaixo da banda: no
              fim, ficavam escondidos na rolagem da ficha (o 1127 do ar) */}
          {linksAntes ? <LinksDoPost links={links} /> : null}
          {legenda ? <p className="vs-legenda">{comLinks(legenda)}</p> : null}
          {soLinks || linksAntes ? null : <LinksDoPost links={links} />}
          {x.tipo === 'post' && x.postId ? <Conversa postId={x.postId} logado={logado} t={t} nivel={naPagina ? 'h2' : 'h3'} /> : null}
        </div>

        {/* A BANDA: a ação principal do visor */}
        <div className="vs-banda" data-so-acao={quemEmCima ? '' : undefined}>
          {quemEmCima ? null : quem}
          {x.autor?.href ? (
            <a className="vs-bt" href={x.autor.href}>{banda ? t.verBanda : t.verPerfil}</a>
          ) : null}
          <div className="vs-mais">
            <button type="button" data-compartilhar={x.href ?? undefined} data-titulo={x.titulo}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 13v6h14v-6" /></svg>
              {t.compartilhar}
            </button>
            {x.href && !naPagina ? (
              <a href={x.href}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M17 14v5H5V7h5" /></svg>
                {t.abrir}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ o visor */
export function Visor({ itens, indice, aoIr, aoFechar, textos = VISOR_PT, origemDe, mostrar, prepararVideo, logado = false }: {
  itens: ItemDoVisor[];
  indice: number;
  aoIr: (i: number) => void;
  aoFechar: () => void;
  textos?: TextosDoVisor;
  /** Onde está, na página, o item de id tal (o quadrado que abriu). */
  origemDe?: (id: string) => DOMRect | null;
  /** Rola a página até o quadrado do item (para a volta do voo). */
  mostrar?: (id: string) => boolean;
  /** Liga o player de vídeo do site (hls.js) ao elemento `<video>`. */
  prepararVideo?: (video: HTMLVideoElement, src: string) => void | (() => void);
  /** Quem está vendo está logado? Sem login, comentar pede o login. */
  logado?: boolean;
}) {
  const t = textos;
  const x = itens[indice];
  const caixa = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const quadro = useRef<HTMLElement>(null);
  const peca = useRef<HTMLDivElement>(null);
  const fita = useRef<HTMLOListElement>(null);
  const [direcao, setDirecao] = useState<'proxima' | 'anterior' | null>(null);
  const abriu = useRef(false);
  const saindo = useRef(false);

  const ir = useCallback((d: number) => {
    const k = indice + d;
    if (k < 0 || k >= itens.length || k === indice) return;
    setDirecao(d > 0 ? 'proxima' : 'anterior');
    aoIr(k);
  }, [indice, itens.length, aoIr]);

  /* O VOO entre o quadrado da página e o visor: o quadro, já no lugar
     final, é levado para cima do quadrado de origem e volta */
  const voo = useCallback((de: DOMRect, ida: boolean) => {
    const el = quadro.current;
    if (!el) return null;
    const ate = el.getBoundingClientRect();
    if (!ate.width || !de.width) return null;
    const k = Math.min(1, Math.max(de.width / ate.width, de.height / ate.height));
    const dx = de.left + de.width / 2 - (ate.left + ate.width / 2);
    const dy = de.top + de.height / 2 - (ate.top + ate.height / 2);
    const longe = { transform: `translate(${dx}px, ${dy}px) scale(${k})`, opacity: 0.35 };
    const perto = { transform: 'none', opacity: 1 };
    return el.animate(ida ? [longe, perto] : [perto, longe], {
      duration: ida ? 460 : 300, easing: ida ? 'cubic-bezier(.2,.8,.25,1)' : 'cubic-bezier(.4,0,.8,.4)', fill: 'both',
    });
  }, []);

  useLayoutEffect(() => {
    if (abriu.current || !x) return;
    abriu.current = true;
    const de = origemDe?.(x.id);
    if (!de || calmo()) return;
    caixa.current?.setAttribute('data-voo', '');
    const a = voo(de, true);
    if (a) a.onfinish = () => { a.cancel(); caixa.current?.removeAttribute('data-voo'); };
    else caixa.current?.removeAttribute('data-voo');
  }, [x, origemDe, voo]);

  const sair = useCallback(() => {
    if (saindo.current) return;
    saindo.current = true;
    let de = x ? origemDe?.(x.id) : null;
    /* o quadrado do item aberto saiu da tela (a pessoa passou vários): a
       página rola até ele, por baixo do visor, e a mídia volta para lá */
    if (x && (!de || de.bottom < 0 || de.top > innerHeight) && mostrar?.(x.id)) de = origemDe?.(x.id) ?? null;
    const visivel = de && de.bottom > 0 && de.top < innerHeight;
    if (!calmo() && visivel) {
      caixa.current?.setAttribute('data-saindo', '');
      const a = voo(de!, false);
      if (a) { a.onfinish = () => aoFechar(); return; }
    }
    aoFechar();
  }, [x, origemDe, mostrar, voo, aoFechar]);

  /* teclado: Esc fecha, setas passam, Tab fica dentro */
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); sair(); return; }
      const alvo = e.target as HTMLElement;
      const escrevendo = !!alvo.closest('input, textarea, [contenteditable]');
      const noSulco = alvo.getAttribute('role') === 'slider';
      if (!escrevendo && !noSulco && e.key === 'ArrowRight') { e.preventDefault(); ir(1); }
      if (!escrevendo && !noSulco && e.key === 'ArrowLeft') { e.preventDefault(); ir(-1); }
      if (e.key === 'Tab' && caixa.current) {
        const foco = [...caixa.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,[tabindex="0"],iframe')]
          .filter((el) => el.offsetParent !== null);
        if (!foco.length) return;
        const [a, z] = [foco[0], foco[foco.length - 1]];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [ir, sair]);

  /* a página atrás não rola, e sem pular: quando a barra de rolagem some,
     a largura dela vira margem (só onde a barra ocupa espaço; no celular e
     no Mac ela flutua e não há o que compensar). E o foco entra no VISOR, e
     não no botão de fechar: com o foco no fechar, o espaço que a pessoa
     aperta para pausar o take fecharia o visor. */
  useEffect(() => {
    const html = document.documentElement;
    const barra = innerWidth - html.clientWidth;
    const antes = [html.style.overflow, html.style.paddingRight];
    html.style.overflow = 'hidden';
    if (barra > 0) html.style.paddingRight = `${barra}px`;
    caixa.current?.focus({ preventScroll: true });
    return () => { html.style.overflow = antes[0]; html.style.paddingRight = antes[1]; };
  }, []);

  /* A IMERSÃO: sem mexer por uns 3 s, as setas, o contador e a fita somem e
     sobram a mídia e a ficha. Qualquer movimento, tecla ou toque devolve. */
  const [quieto, setQuieto] = useState(false);
  const sono = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const acordar = useCallback(() => {
    setQuieto(false);
    clearTimeout(sono.current);
    sono.current = setTimeout(() => {
      const foco = document.activeElement;
      if (!foco?.closest('.vs-fita, .vs-seta, .vs-topo')) setQuieto(true);
    }, 3000);
  }, []);
  useEffect(() => {
    acordar();
    const ver = () => acordar();
    document.addEventListener('keydown', ver);
    return () => { document.removeEventListener('keydown', ver); clearTimeout(sono.current); };
  }, [acordar]);

  /* a próxima e a anterior já vêm carregadas; a fita segue o atual */
  useEffect(() => {
    for (const k of [indice + 1, indice - 1]) {
      const v = itens[k];
      if (v?.imagem && !v.video && !v.youtube) { const im = new Image(); im.src = v.imagem; }
    }
    const f = fita.current;
    const atual = f?.querySelector<HTMLElement>('[aria-current="true"]');
    if (f && atual) f.scrollTo({ left: atual.parentElement!.offsetLeft - f.clientWidth / 2 + atual.clientWidth / 2, behavior: calmo() ? 'auto' : 'smooth' });
  }, [indice, itens]);

  /* O DEDO: para os lados passa; para baixo, no celular, fecha */
  const dedo = useRef<{ x: number; y: number; eixo: 'x' | 'y' | null } | null>(null);
  const aoTocar = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    if ((e.target as HTMLElement).closest('.vs-ficha, .vv-barra, .vs-fita')) return;
    dedo.current = { x: e.clientX, y: e.clientY, eixo: null };
  };
  const aoArrastar = (e: React.PointerEvent) => {
    const d = dedo.current;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.eixo && Math.hypot(dx, dy) > 10) d.eixo = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x';
    if (d.eixo === 'y' && dy > 0 && peca.current && !calmo()) {
      peca.current.style.transform = `translateY(${dy}px) scale(${1 - Math.min(dy, 400) / 2000})`;
      caixa.current?.style.setProperty('--vs-fundo', String(Math.max(0.2, 1 - dy / 400)));
    }
  };
  const aoSoltar = (e: React.PointerEvent) => {
    const d = dedo.current;
    dedo.current = null;
    if (!d) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    const p = peca.current;
    /* um toque parado na mídia esconde ou mostra a interface (imersão) */
    const alvo = e.target as HTMLElement;
    if (!d.eixo && alvo.closest('.vs-quadro') && !alvo.closest('button, .vv-barra')) {
      if (quieto) acordar(); else { clearTimeout(sono.current); setQuieto(true); }
    }
    if (d.eixo === 'y' && dy > 110) {
      if (p) p.style.transform = '';
      caixa.current?.style.removeProperty('--vs-fundo');
      sair();
      return;
    }
    if (p) {
      p.style.transition = 'transform .25s cubic-bezier(.2,.8,.25,1)';
      p.style.transform = '';
      setTimeout(() => { if (p) p.style.transition = ''; }, 260);
    }
    caixa.current?.style.removeProperty('--vs-fundo');
    if (d.eixo === 'x' && Math.abs(dx) > 56) ir(dx < 0 ? 1 : -1);
  };

  if (!x) return null;

  return (
    <div className="vs" role="dialog" aria-modal="true" aria-labelledby="vs-tit" ref={caixa} data-tipo={x.tipo} tabIndex={-1}
         data-quieto={quieto ? '' : undefined} onPointerMove={(e) => { if (e.pointerType === 'mouse') acordar(); }}>
      <button type="button" className="vs-fundo" tabIndex={-1} aria-hidden="true" onClick={sair}></button>

      <div className="vs-topo">
        <p className="vs-conta" aria-live="polite">{itens.length > 1 ? t.posicao(indice + 1, itens.length) : ''}</p>
        <button type="button" className="vs-fechar" ref={fechar} onClick={sair} aria-label={t.fechar}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>

      <div className="vs-cena" onPointerDown={aoTocar} onPointerMove={aoArrastar} onPointerUp={aoSoltar} onPointerCancel={aoSoltar}>
        {itens.length > 1 && (
          <button type="button" className="vs-seta" data-lado="anterior" onClick={() => ir(-1)} disabled={indice === 0} aria-label={t.anterior}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
        )}

        <PecaDoVisor key={x.id} x={x} t={t} logado={logado} prepararVideo={prepararVideo}
                     pecaRef={peca} quadroRef={quadro} direcao={direcao} />

        {itens.length > 1 && (
          <button type="button" className="vs-seta" data-lado="proxima" onClick={() => ir(1)} disabled={indice >= itens.length - 1} aria-label={t.proxima}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>

      {/* A FITA DA GALERIA: tudo o que a página abriu, em miniatura */}
      {itens.length > 1 && (
        <nav className="vs-fita" aria-label={t.galeria}>
          <ol ref={fita}>
            {itens.map((v, i) => (
              <li key={v.id}>
                <button type="button" aria-current={i === indice ? 'true' : undefined} onClick={() => ir(i - indice)}
                        aria-label={`${t.posicao(i + 1, itens.length)}: ${v.rotulo || t.tipos[v.tipo]}, ${igual(v.titulo, v.autor?.nome) ? v.autor?.nome : v.titulo}`}>
                  {v.miniatura || v.imagem ? (
                    <img src={(v.miniatura || v.imagem)!} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <FitaTexto v={v} />
                  )}
                  {v.duracao ? <small aria-hidden="true">{mmss(v.duracao)}</small> : null}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
}

/* =========================================================================
   useVisor: o visor ligado a uma página

   Pega o clique em qualquer `[data-visor="id"]` dentro de `raiz`, abre o
   visor naquele item e cuida do endereço e do "voltar". A página diz qual é
   a lista no momento do clique (`lista(id)`), que pode depender do filtro.
   Com Ctrl, Cmd, Shift ou botão do meio, o link abre a página, como sempre.

     const visor = useVisor('.radar', (id) => listaDoMomento);
     ...
     {visor.props && <Visor {...visor.props} textos={...} />}
   ========================================================================= */
export function useVisor(raiz: string, lista: (id: string) => ItemDoVisor[]) {
  const [estado, setEstado] = useState<{ itens: ItemDoVisor[]; i: number } | null>(null);
  const empurrou = useRef(false);
  const restauracao = useRef<ScrollRestoration>('auto');
  const origem = useRef<HTMLElement | null>(null);
  const listaRef = useRef(lista);
  listaRef.current = lista;
  const estadoRef = useRef(estado);
  estadoRef.current = estado;

  useEffect(() => {
    const aoClicar = (ev: MouseEvent) => {
      if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      const a = (ev.target as Element | null)?.closest<HTMLElement>(`${raiz} [data-visor]`);
      if (!a) return;
      const id = a.dataset.visor!;
      const itens = listaRef.current(id);
      const i = itens.findIndex((x) => x.id === id);
      if (i < 0) return;
      ev.preventDefault();
      origem.current = a;
      if (itens[i].href) {
        /* o "voltar" que fecha o visor não pode devolver a página para onde
           ela estava ao abrir: ao fechar, ela fica no quadrado do item */
        restauracao.current = history.scrollRestoration;
        history.scrollRestoration = 'manual';
        history.pushState({ visor: id }, '', itens[i].href!);
        empurrou.current = true;
      }
      setEstado({ itens, i });
    };
    const aoVoltar = () => {
      if (!empurrou.current) return;
      empurrou.current = false;
      setEstado(null);
      setTimeout(() => { history.scrollRestoration = restauracao.current; }, 0);
    };
    document.addEventListener('click', aoClicar);
    window.addEventListener('popstate', aoVoltar);
    return () => { document.removeEventListener('click', aoClicar); window.removeEventListener('popstate', aoVoltar); };
  }, [raiz]);

  /* ao fechar, o foco volta para quem abriu */
  useEffect(() => { if (!estado) origem.current?.focus({ preventScroll: true }); }, [estado]);

  const aoFechar = useCallback(() => {
    if (empurrou.current) history.back(); // o popstate fecha
    else setEstado(null);
  }, []);
  const aoIr = useCallback((i: number) => {
    const e = estadoRef.current;
    if (!e) return;
    const h = e.itens[i]?.href;
    /* o endereço troca FORA da atualização de estado: o roteador do Next
       também escuta o histórico */
    if (h && empurrou.current) history.replaceState({ visor: e.itens[i].id }, '', h);
    setEstado({ ...e, i });
  }, []);

  /* O mesmo item pode estar em mais de um lugar (no Radar, o quadrado e o
     ponto na tela). Vale o que a pessoa clicou; para outro item da galeria,
     o maior lugar dele que estiver na tela. */
  const origemDe = useCallback((id: string) => {
    const caixa = (el: Element) => (el.querySelector('img, video') ?? el).getBoundingClientRect();
    if (origem.current?.dataset.visor === id) {
      const r = caixa(origem.current);
      if (r.width) return r;
    }
    let melhor: DOMRect | null = null;
    let area = 0;
    document.querySelectorAll<HTMLElement>(`${raiz} [data-visor="${CSS.escape(id)}"]`).forEach((el) => {
      const r = caixa(el);
      const naTela = r.bottom > 0 && r.top < innerHeight;
      if (r.width && naTela && r.width * r.height > area) { melhor = r; area = r.width * r.height; }
    });
    return melhor;
  }, [raiz]);

  /* rola a página até o maior lugar do item (o quadrado do mosaico) */
  const mostrar = useCallback((id: string) => {
    let el: HTMLElement | null = null;
    let area = 0;
    document.querySelectorAll<HTMLElement>(`${raiz} [data-visor="${CSS.escape(id)}"]`).forEach((c) => {
      const r = c.getBoundingClientRect();
      if (r.width * r.height > area) { el = c; area = r.width * r.height; }
    });
    if (!el) return false;
    (el as HTMLElement).scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
    origem.current = el;
    return true;
  }, [raiz]);

  return {
    aberto: !!estado,
    props: estado ? { itens: estado.itens, indice: estado.i, aoIr, aoFechar, origemDe, mostrar } : null,
  };
}
