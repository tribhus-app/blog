import type { ReactNode } from 'react';

/* =========================================================================
   OS LINKS DO POST

   No ar, o post que traz um link (a faixa no Spotify, o perfil no
   Instagram, o SoundCloud) mostra o endereço como texto solto: não se
   clica, não diz para onde vai, e o post de uma linha só vira uma linha de
   endereço. São posts de "ouça a minha música": o link é o post.

   Sem campo novo no backend: tudo sai do texto que o post já tem.
   - As linhas que são só um link (ou um link com um emoji, ou um rótulo
     como "Ouça no Spotify:" logo acima) saem do texto e viram o CARTÃO DE
     LINKS, uma etiqueta de papel na ficha, uma linha por destino, com o
     verbo e o serviço ("Ouvir no Spotify") e o que é ("Faixa", "@banda").
   - O link no meio de uma frase continua na frase, clicável e encurtado.
   - O post que era só o link mostra o cartão no lugar do texto, grande.

   Só http e https. Link de fora abre em outra aba, com `rel` de conteúdo
   de usuário; link da própria Tribhus abre na mesma.
   ========================================================================= */

export type LinkDoPost = {
  url: string;
  /** "Ouvir no Spotify", "Ver no Instagram", "Abrir o site". */
  acao: string;
  /** O que é: "Faixa", "Disco", "@discarrego", "discarrego.com". */
  oque: string;
  /** Link da própria Tribhus: abre na mesma aba. */
  daCasa: boolean;
};

type Servico = { nome: string; verbo: 'Ouvir' | 'Ver'; oque: (p: string[], u: URL) => string | null };

const handle = (s?: string) => (s ? `@${s.replace(/^@/, '')}` : null);
const SERVICOS: [RegExp, Servico][] = [
  [/(^|\.)spotify\.(com|link)$/, { nome: 'Spotify', verbo: 'Ouvir', oque: (p) => {
    const q = p.filter((x) => !/^intl-/.test(x));
    return ({ track: 'Faixa', album: 'Disco', artist: 'Artista', playlist: 'Playlist', episode: 'Episódio', show: 'Podcast' } as Record<string, string>)[q[0]] ?? null;
  } }],
  [/(^|\.)instagram\.com$/, { nome: 'Instagram', verbo: 'Ver', oque: (p) =>
    p[0] === 'p' ? 'Post' : p[0] === 'reel' || p[0] === 'reels' ? 'Reel' : p[0] === 'stories' ? 'Story' : handle(p[0]) }],
  [/(^|\.)soundcloud\.com$/, { nome: 'SoundCloud', verbo: 'Ouvir', oque: (p) =>
    p[1] === 'sets' ? 'Playlist' : p[1] ? 'Faixa' : handle(p[0]) }],
  [/^music\.youtube\.com$/, { nome: 'YouTube Music', verbo: 'Ouvir', oque: (p) => (p[0] === 'playlist' ? 'Playlist' : p[0] === 'watch' ? 'Faixa' : null) }],
  [/(^|\.)(youtube\.com|youtu\.be)$/, { nome: 'YouTube', verbo: 'Ver', oque: (p, u) =>
    u.hostname.endsWith('youtu.be') || p[0] === 'watch' || p[0] === 'shorts' ? 'Vídeo' : p[0] === 'playlist' ? 'Playlist' : p[0]?.startsWith('@') ? p[0] : 'Canal' }],
  [/(^|\.)deezer\.(com|page\.link)$/, { nome: 'Deezer', verbo: 'Ouvir', oque: (p) => {
    const q = p.filter((x) => !/^[a-z]{2}$/.test(x));
    return ({ track: 'Faixa', album: 'Disco', artist: 'Artista', playlist: 'Playlist' } as Record<string, string>)[q[0]] ?? null;
  } }],
  [/\.bandcamp\.com$/, { nome: 'Bandcamp', verbo: 'Ouvir', oque: (p) => (p[0] === 'track' ? 'Faixa' : p[0] === 'album' ? 'Disco' : null) }],
  [/^music\.apple\.com$/, { nome: 'Apple Music', verbo: 'Ouvir', oque: (p, u) => {
    const k = p.find((x) => ['album', 'artist', 'playlist', 'song'].includes(x));
    if (k === 'album' && u.searchParams.get('i')) return 'Faixa';
    return k ? ({ album: 'Disco', artist: 'Artista', playlist: 'Playlist', song: 'Faixa' } as Record<string, string>)[k] : null;
  } }],
  [/(^|\.)tiktok\.com$/, { nome: 'TikTok', verbo: 'Ver', oque: (p) => (p[1] === 'video' ? 'Vídeo' : p[0]?.startsWith('@') ? p[0] : null) }],
  [/(^|\.)(x|twitter)\.com$/, { nome: 'X', verbo: 'Ver', oque: (p) => (p[1] === 'status' ? 'Post' : handle(p[0])) }],
  [/(^|\.)(facebook\.com|fb\.com|fb\.watch)$/, { nome: 'Facebook', verbo: 'Ver', oque: () => null }],
];

const CASA = /(^|\.)tribhus\.com(\.br)?$/;
/* o link solto: http(s) ou www, até o primeiro espaço ou aspas */
const NO_TEXTO = /\b(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;
/* a linha que é só um domínio ("discarrego.com"), sem http */
const DOMINIO = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|net|org|art|band|music|rocks|io|me|app|site|store|br)(?:\.br)?(?:\/\S*)?$/i;

/** Tira do fim a pontuação que é da frase e não do link. */
function aparar(s: string) {
  let u = s.replace(/[.,;:!?…»"')\]}]+$/, '');
  if (s.slice(u.length).startsWith(')') && u.includes('(')) u += ')';
  return u;
}

function ler(cru: string): LinkDoPost | null {
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(cru) ? cru : `https://${cru}`); } catch { return null; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  const host = u.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  const partes = u.pathname.split('/').filter(Boolean).map((x) => decodeURIComponent(x));
  if (CASA.test(host)) return { url: u.href, acao: 'Abrir na Tribhus', oque: partes[0] === 'bandas' && partes[1] ? `@${partes[1]}` : 'Tribhus', daCasa: true };
  for (const [re, s] of SERVICOS) {
    if (re.test(host)) return { url: u.href, acao: `${s.verbo} no ${s.nome}`, oque: s.oque(partes, u) ?? host, daCasa: false };
  }
  return { url: u.href, acao: 'Abrir o site', oque: host + (partes.length ? `/${partes.join('/')}` : ''), daCasa: false };
}

/** O QUE É O LINK QUE VEM FORA DO TEXTO (o `video_url` do post, onde o
 *  "colar link" do app grava): `'youtube'` vira o player do YouTube;
 *  `'link'` (Spotify e os outros serviços, ou a própria Tribhus) vai para o
 *  cartão de links; `null` é o arquivo de vídeo do post, que toca. */
export function oQueEoLink(url: string | null | undefined): 'youtube' | 'link' | null {
  const l = url?.trim() ? ler(url.trim()) : null;
  if (!l) return null;
  if (l.acao === 'Ver no YouTube') return 'youtube';
  return l.daCasa || l.acao !== 'Abrir o site' ? 'link' : null;
}

const chave = (url: string) => url.replace(/^https?:\/\/(www\.|m\.)?/i, '').replace(/[/?#]+$/, '').toLowerCase();

/** O que sobra de uma linha sem os links: se não tem letra nem número, a
 *  linha era só o link (com um emoji, um traço, uma seta). */
const soLink = (linha: string) => {
  const t = linha.trim();
  if (DOMINIO.test(t)) return true;
  const resto = t.replace(NO_TEXTO, '');
  if (resto === t) return false;
  /* "Ouça no Spotify: https://..." também: o rótulo curto antes do link */
  return !/[\p{L}\p{N}]/u.test(resto) || /^[^.!?\n]{1,40}:\s*$/u.test(resto.trim());
};

/**
 * Separa o texto do post em texto (sem as linhas que são só link) e links
 * (os destinos, na ordem, sem repetir). `ignorar` são endereços que a peça
 * já mostra de outro jeito (o vídeo do YouTube que já está embutido).
 */
export function separarLinks(texto: string | null | undefined, ignorar: (url: string) => boolean = () => false): { texto: string | null; links: LinkDoPost[] } {
  if (!texto) return { texto: null, links: [] };
  const vistos = new Set<string>();
  const links: LinkDoPost[] = [];
  const guardar = (cru: string) => {
    const l = ler(aparar(cru));
    if (!l || ignorar(l.url) || vistos.has(chave(l.url))) return;
    vistos.add(chave(l.url));
    links.push(l);
  };
  const linhas = texto.split('\n');
  const fora = linhas.map(soLink);
  linhas.forEach((linha) => {
    const t = linha.trim();
    if (DOMINIO.test(t)) guardar(t);
    else (t.match(NO_TEXTO) ?? []).forEach(guardar);
  });
  /* "Ouça no Spotify:" logo acima de uma linha que saiu: o cartão já diz */
  linhas.forEach((linha, k) => {
    if (fora[k] || !/:\s*$/.test(linha) || linha.trim().length > 40) return;
    const prox = linhas.slice(k + 1).findIndex((x) => x.trim());
    if (prox >= 0 && fora[k + 1 + prox]) fora[k] = true;
  });
  const sobra = linhas.filter((_, k) => !fora[k]).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  /* ouvir vem primeiro: no post de banda, é a ação. Depois ver, a casa e o
     site; dentro de cada grupo, a ordem do texto */
  const peso = (l: LinkDoPost) => (l.acao.startsWith('Ouvir') ? 0 : l.acao.startsWith('Ver') ? 1 : l.daCasa ? 2 : 3);
  return { texto: sobra || null, links: links.map((l, k) => [l, k] as const).sort((a, b) => peso(a[0]) - peso(b[0]) || a[1] - b[1]).map(([l]) => l).slice(0, 6) };
}

/** O link que ficou no meio de uma frase, clicável e curto. */
export function comLinks(texto: string): ReactNode[] {
  const saida: ReactNode[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(NO_TEXTO)) {
    const cru = aparar(m[0]);
    const l = ler(cru);
    const ini = m.index ?? 0;
    if (!l) continue;
    saida.push(texto.slice(ultimo, ini));
    const curto = cru.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
    saida.push(
      <a key={ini} className="vs-link-solto" href={l.url} {...(l.daCasa ? {} : { target: '_blank', rel: 'noopener noreferrer nofollow ugc' })}>
        {curto.length > 34 ? `${curto.slice(0, 32)}…` : curto}
      </a>,
    );
    ultimo = ini + cru.length;
  }
  saida.push(texto.slice(ultimo));
  return saida;
}

const seta = <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 16 16 8M9.5 8H16v6.5" /></svg>;

/** O cartão: uma etiqueta de papel, uma linha por destino. `grande` é o
 *  post que era só o link: o cartão ocupa o lugar do texto. */
export function LinksDoPost({ links, grande = false }: { links: LinkDoPost[]; grande?: boolean }) {
  if (!links.length) return null;
  return (
    <ul className="vs-links" data-grande={grande ? '' : undefined} aria-label="Links do post">
      {links.map((l) => (
        <li key={l.url}>
          <a href={l.url} {...(l.daCasa ? {} : { target: '_blank', rel: 'noopener noreferrer nofollow ugc' })}>
            <b>{l.acao}</b>
            <small>{l.oque}</small>
            {seta}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** O post que era só o link, em miniatura (o ladrilho do Radar, a fileira
 *  embaixo do post): a mesma etiqueta do visor, medida pelo quadro, no lugar
 *  do endereço. É desenho dentro de um quadro que já é link: não se clica. */
export function BilheteDoLink({ link }: { link: LinkDoPost }) {
  return (
    <span className="bilhete-palco" aria-hidden="true">
      <span className="bilhete">
        <b>{link.acao}</b>
        {link.oque ? <small>{link.oque}</small> : null}
        {seta}
      </span>
    </span>
  );
}
