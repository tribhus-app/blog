/* Os ícones do painel: traço de 1,75, ponta redonda, na cor do texto. Um
   desenho por coisa e nenhum colorido: no ar cada ícone tinha uma cor
   (laranja, amarelo, roxo, azul) e era isso que fazia o painel parecer
   modelo pronto. Os mesmos significados do ar, no mesmo lugar. */

const D = {
  dashboard: <><path d="M4 11.5 12 5l8 6.5" /><path d="M6 10v9h4.5v-5h3v5H18v-9" /></>,
  analytics: <><path d="M5 19V11" /><path d="M10 19V6" /><path d="M15 19v-5" /><path d="M20 19V9" /></>,
  posts: <><rect x="5" y="4" width="14" height="16" rx="1.5" /><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" /></>,
  mais: <><path d="M12 5v14M5 12h14" /></>,
  categorias: <><path d="M4 12.2V5.5A1.5 1.5 0 0 1 5.5 4h6.7L20 11.8 11.8 20Z" /><circle cx="8.5" cy="8.5" r="1.2" /></>,
  autores: <><circle cx="9" cy="8.5" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M15.5 5.8a3 3 0 0 1 0 5.4M17.5 14a5.5 5.5 0 0 1 3 5" /></>,
  manual: <><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5Z" /><path d="M12 6v13.5" /></>,
  ia: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9.5 10h5v4h-5z" /><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></>,
  verBlog: <><path d="M13.5 4H20v6.5" /><path d="M20 4 11 13" /><path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" /></>,
  voltar: <><path d="M15 5 8 12l7 7" /></>,
  seta: <><path d="M9 5l7 7-7 7" /></>,
  abaixo: <><path d="m7 10 5 5 5-5" /></>,
  fechar: <><path d="m7 7 10 10M17 7 7 17" /></>,
  busca: <><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></>,
  editar: <><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>,
  excluir: <><path d="M4.5 7h15M10 4h4M6.5 7l1 12.5h9l1-12.5" /><path d="M10 11v5M14 11v5" /></>,
  ver: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>,
  esconder: <><path d="M3 3l18 18" /><path d="M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.8M6.6 6.7A16.8 16.8 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 4.4-1.1" /><path d="M9.9 10a2.8 2.8 0 0 0 4 4" /></>,
  publicar: <><path d="M12 19V6" /><path d="m6.5 11.5 5.5-5.5 5.5 5.5" /><path d="M5 4h14" /></>,
  check: <><path d="m5 12.5 4.5 4.5L19 7.5" /></>,
  imagem: <><rect x="4" y="5" width="16" height="14" rx="1.5" /><circle cx="9" cy="10" r="1.6" /><path d="m4.5 17 5-4.5 3.5 3 2.5-2 4 3.5" /></>,
  video: <><rect x="3.5" y="6" width="12.5" height="12" rx="1.5" /><path d="m16 10.5 4.5-2.5v8L16 13.5" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 6.8" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" /></>,
  lista: <><path d="M9 7h11M9 12h11M9 17h11" /><circle cx="4.8" cy="7" r=".9" /><circle cx="4.8" cy="12" r=".9" /><circle cx="4.8" cy="17" r=".9" /></>,
  listaNum: <><path d="M10 7h10M10 12h10M10 17h10" /><path d="M4 5.5h1.3V9M4 9h2.6M4.2 13.6c.3-.5.8-.8 1.3-.8.8 0 1.3.5 1.3 1.1 0 .9-1.6 1.8-2.6 2.6h2.6" /></>,
  citacao: <><path d="M5 17v-4.5C5 9 6.5 7 9 6.5M5 12.5h3.5V17H5M14 17v-4.5c0-3.5 1.5-5.5 4-6M14 12.5h3.5V17H14" /></>,
  codigo: <><path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 5.5l-3 13" /></>,
  desfazer: <><path d="M8 7 4 11l4 4" /><path d="M4.5 11H14a5.5 5.5 0 0 1 0 11h-2" /></>,
  refazer: <><path d="m16 7 4 4-4 4" /><path d="M19.5 11H10a5.5 5.5 0 0 0 0 11h2" /></>,
  enviar: <><path d="M12 16V5" /><path d="m7.5 9.5 4.5-4.5 4.5 4.5" /><path d="M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15" /></>,
  relogio: <><circle cx="12" cy="12" r="8" /><path d="M12 7.5V12l3 2" /></>,
  destaque: <><path d="m12 4 2.4 5 5.4.7-4 3.7 1 5.4L12 16.2 7.2 18.8l1-5.4-4-3.7 5.4-.7Z" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  sair: <><path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" /><path d="M10 8l-4 4 4 4M6 12h10" /></>,
  atualizar: <><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.5v4h-4" /></>,
  raio: <><path d="M13 3 5 13.5h6L10 21l8-10.5h-6Z" /></>,
  aviso: <><path d="M12 4 2.8 19.5h18.4Z" /><path d="M12 10v4.5M12 17v.2" /></>,
} as const;

export type NomeDoIcone = keyof typeof D;

export function Icone({ nome, tamanho = 20 }: { nome: NomeDoIcone; tamanho?: number }) {
  return (
    <svg className="adm-ic" width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {D[nome]}
    </svg>
  );
}
