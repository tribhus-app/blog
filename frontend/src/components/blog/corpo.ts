/* =========================================================================
   O CORPO DO ARTIGO, PREPARADO NO SERVIDOR

   O texto vem do painel do blog como HTML (com as classes do Tailwind do
   blog antigo). Antes de ir para a página, ele passa por aqui, uma vez, no
   servidor. Nada disto pede campo novo: tudo sai do próprio texto.

   - As classes do blog antigo saem: quem desenha o texto é o CSS da casa.
   - Cada h2 e h3 ganha um id, e a lista deles vira o índice vivo.
   - A foto solta vira figura: abre no visor da casa ao tocar, e a descrição
     (o `alt`, que no ar já é escrito à mão) vira a legenda. O alt genérico
     ("Imagem do post") não vira legenda.
   - O vídeo do YouTube vira a miniatura com o play. O player do YouTube só
     carrega quando a pessoa aperta: um iframe pesa mais de meio megabyte, e
     207 artigos têm vídeo.
   - O link para a Tribhus fica relativo (não sai do site); o de fora abre
     em outra aba.
   - O primeiro parágrafo que repete o resumo sai (23 artigos no ar
     repetem: o resumo já está embaixo do título).
   - O tempo de leitura sai da contagem de palavras, a 200 por minuto.
   ========================================================================= */

export interface SecaoDoArtigo { id: string; t: string; nivel: 2 | 3 }
export interface FotoDoArtigo { id: string; src: string; alt: string; legenda: string | null }

export interface CorpoPreparado {
  html: string;
  secoes: SecaoDoArtigo[];
  fotos: FotoDoArtigo[];
  minutos: number;
  /** As bandas que o texto cita (`/bandas/<slug>`), na ordem em que
   *  aparecem. O site busca cada uma e passa para a página. */
  bandasCitadas: string[];
}

const ALT_GENERICO = /^(imagem( do post)?|image|foto|img|)$/i;

export const slugDoTexto = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);

export const semTags = (s: string) =>
  s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

const atributo = (tag: string, nome: string) =>
  tag.match(new RegExp(`\\s${nome}\\s*=\\s*"([^"]*)"`, 'i'))?.[1]
  ?? tag.match(new RegExp(`\\s${nome}\\s*=\\s*'([^']*)'`, 'i'))?.[1] ?? null;

const escapar = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function idDoYouTube(src: string): string | null {
  const m = src.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** `miniatura` só existe para o exemplo, que não tem vídeo de verdade. No
 *  site, não passe: vale a miniatura do próprio YouTube. */
export function prepararCorpo(conteudo: string, resumo?: string | null,
  miniatura: (id: string) => string = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  /** A capa do artigo: a foto do texto que repete a capa sai. */
  capa?: string | null): CorpoPreparado {
  let html = conteudo;

  // 1. as classes do blog antigo
  html = html.replace(/\s(class|style)\s*=\s*"[^"]*"/gi, '');

  // 2. o vídeo: o iframe (sozinho ou embrulhado num div) vira miniatura
  html = html.replace(/(?:<div>\s*)?<iframe\b[^>]*>\s*<\/iframe>(?:\s*<\/div>)?/gi, (bloco) => {
    const src = atributo(bloco.match(/<iframe\b[^>]*>/i)![0], 'src') ?? '';
    const id = idDoYouTube(src);
    if (!id) return '';
    return `<div class="bl-video" data-yt="${id}"><button type="button" class="bl-video-bt" aria-label="Assistir ao vídeo no YouTube">`
      + `<img data-yt-capa src="${miniatura(id)}" alt="" loading="lazy" decoding="async" width="480" height="360">`
      + `<span class="bl-video-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg></span>`
      + `</button></div>`;
  });

  // 3. a foto vira figura (tirando o <p> que às vezes a embrulha). A
  //    miniatura do vídeo (passo 2) fica como está; a foto que repete a capa
  //    sai (nos artigos antigos, a capa volta como primeira foto do texto).
  const fotos: FotoDoArtigo[] = [];
  const nomeDe = (u: string) => u.split(/[?#]/)[0].split('/').pop() ?? '';
  html = html.replace(/(?:<p>\s*)?<img\b[^>]*>(?:\s*<\/p>)?/gi, (bloco) => {
    const tag = bloco.match(/<img\b[^>]*>/i)![0];
    if (/\sdata-yt-capa\b/.test(tag)) return bloco;
    const src = atributo(tag, 'src');
    if (!src) return '';
    if (capa && nomeDe(src) === nomeDe(capa)) return '';
    const alt = (atributo(tag, 'alt') ?? '').trim();
    const legenda = ALT_GENERICO.test(alt) ? null : alt;
    const id = `foto-${fotos.length + 1}`;
    fotos.push({ id, src, alt: legenda ?? '', legenda });
    return `<figure class="bl-fig"><a class="bl-foto" href="${escapar(src)}" data-visor="${id}" aria-label="Ampliar a foto${legenda ? `: ${escapar(legenda)}` : ''}">`
      + `<img src="${escapar(src)}" alt="${escapar(legenda ?? '')}" loading="lazy" decoding="async"></a>`
      + (legenda ? `<figcaption>${escapar(legenda)}</figcaption>` : '') + `</figure>`;
  });

  // 4. os títulos de dentro ganham id, e viram o índice
  const secoes: SecaoDoArtigo[] = [];
  const usados = new Set<string>();
  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/gi, (_, n: string, dentro: string) => {
    const t = semTags(dentro);
    let id = slugDoTexto(t) || `parte-${secoes.length + 1}`;
    while (usados.has(id)) id += '-2';
    usados.add(id);
    secoes.push({ id, t, nivel: n === '2' ? 2 : 3 });
    return `<h${n} id="${id}">${dentro}</h${n}>`;
  });

  // 5. "Leia também" é a lista de outros artigos do próprio blog, e "Links"
  //    a das redes da banda; os dois são blocos do fim, não texto corrido.
  //    O fio (<hr>) que o editor põe antes deles sai: o bloco já tem o dele.
  html = html.replace(/(?:<hr\s*\/?>\s*)?<h4>\s*Leia também\s*<\/h4>\s*<ul>([\s\S]*?)<\/ul>/gi,
    (_, itens: string) => `<aside class="bl-leia"><h4>Leia também</h4><ul>${itens}</ul></aside>`);
  html = html.replace(/(?:<hr\s*\/?>\s*)?<h4>\s*Links\s*<\/h4>\s*<ul>([\s\S]*?)<\/ul>/gi,
    (_, itens: string) => `<aside class="bl-links"><h4>Links</h4><ul>${itens}</ul></aside>`);

  // 5b. "Descubra na Tribhus" vem como citação, mas é o convite para o
  //     site: vira a caixa do convite, com o link como botão
  html = html.replace(/<blockquote>\s*<p>\s*<strong>\s*Descubra na Tribhus:?\s*<\/strong>:?\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi,
    (_, dentro: string) => {
      const link = dentro.match(/<a\b[^>]*>[\s\S]*?<\/a>/i)?.[0] ?? '';
      const frase = dentro.replace(link, '').trim();
      const botao = link.replace(/<a\b/i, '<a data-convite').replace(/\s*(&rarr;|→)\s*/g, '');
      return `<aside class="bl-descubra"><p class="bl-descubra-rot">Descubra na Tribhus</p><p>${frase}</p>${botao ? `<p>${botao}</p>` : ''}</aside>`;
    });

  // 6. os links: os da casa ficam relativos, os de fora abrem em outra aba
  const bandas: string[] = [];
  html = html.replace(/<a\b([^>]*)>/gi, (tag, atrs: string) => {
    let href = atributo(tag, 'href') ?? '';
    href = href.replace(/^https?:\/\/(www\.)?tribhus\.com(\.br)?(?=\/|$)/i, '') || '/';
    const banda = href.match(/^\/bandas\/([a-z0-9._-]+)\/?$/i)?.[1];
    if (banda && !bandas.includes(banda)) bandas.push(banda);
    const deFora = /^https?:\/\//i.test(href);
    const resto = atrs.replace(/\s(href|target|rel)\s*=\s*"[^"]*"/gi, '');
    return `<a href="${escapar(href)}"${resto}${deFora ? ' target="_blank" rel="noopener"' : ''}>`;
  });

  // 7. o primeiro parágrafo que repete o resumo
  if (resumo) {
    const r = semTags(resumo).toLowerCase();
    html = html.replace(/^\s*<p>([\s\S]*?)<\/p>/i, (p, dentro: string) =>
      semTags(dentro).toLowerCase() === r ? '' : p);
  }

  // 8. parágrafo vazio que o editor deixa para trás
  html = html.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '');

  const palavras = semTags(html).split(' ').filter(Boolean).length;
  return { html, secoes, fotos, minutos: Math.max(1, Math.round(palavras / 200)), bandasCitadas: bandas };
}

/* ---------- O RESUMO ----------
   O `excerpt`; sem ele, a `metaDescription`. Nos 230 artigos antigos os
   dois são o começo do texto, cortado no meio da palavra e com o
   Markdown cru ("...Descobertas Tribhus. ## **VACILATION SOCIETY** Abrimos
   nossas desc..."). Aqui ela sai sem as marcas e termina na última frase
   inteira. E, quando se passa o corpo, a que só repete o começo do texto
   não aparece: o texto logo abaixo já diz a mesma coisa. */
const semMarcas = (s: string) => s.replace(/[#*_`>]+/g, ' ').replace(/\s+/g, ' ').trim();

export function resumoDe(a: { excerpt?: string | null; metaDescription?: string | null }, corpo?: string): string | null {
  /* o `excerpt` dos antigos também é o começo do texto, cortado e com as
     marcas: a mesma limpeza vale para os dois */
  let m = semMarcas(a.excerpt?.trim() || a.metaDescription || '');
  if (!m) return null;
  if (/(\.\.\.|…)$/.test(m)) {
    const fim = Math.max(m.lastIndexOf('. '), m.lastIndexOf('? '), m.lastIndexOf('! '));
    m = fim > 40 ? m.slice(0, fim + 1) : '';
  }
  if (!m) return null;
  if (corpo) {
    const comeco = (s: string) => semMarcas(s).toLowerCase().slice(0, 60);
    if (comeco(semTags(corpo)) === comeco(m)) return null;
  }
  return m;
}

/* ---------- AS SÉRIES ----------
   "Descobertas Tribhus" (70 no ar), "Não Deixe de Ouvir" (49) e "Tribhar"
   são colunas fixas, como num zine, mas o blog não tem campo para isso: o
   nome está no começo do título. A página separa o nome da série do resto
   para desenhar a série como selo; o H1 continua com as mesmas palavras. */
const SERIES = ['Descobertas Tribhus', 'Não Deixe de Ouvir', 'Tribhar'];

export function serieDoTitulo(titulo: string): { serie: string | null; resto: string } {
  const limpo = titulo.replace(/\s+/g, ' ').trim();
  for (const s of SERIES) {
    const re = new RegExp(`^${s}\\s*[-–:|]?\\s*`, 'i');
    if (re.test(limpo)) return { serie: s, resto: limpo.replace(re, '') };
  }
  return { serie: null, resto: limpo };
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
  'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "27 de outubro de 2026", no fuso de São Paulo (sem zero na frente: no ar
 *  o artigo dizia "05" e o cartão "5"). */
export function dataPorExtenso(iso: string): string {
  const d = new Date(new Date(iso).toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}

/* A CAPA QUE VOA: o mesmo nome no cartão e na capa do artigo, e o navegador
   leva a foto de um lugar para o outro quando se abre a matéria (a
   transição entre páginas do próprio navegador, `@view-transition` no
   35-blog.css). Onde não houver suporte, a página só abre, como sempre.
   O nome não pode repetir numa página: por isso só o cartão, o destaque e
   a capa do artigo usam (nunca as listas pequenas de Mais lidas). */
export const capaQueVoa = (slug: string) => `capa-${slug.replace(/[^a-z0-9-]/gi, '')}`;
