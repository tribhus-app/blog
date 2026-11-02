import Link from 'next/link';
import type { ReactNode } from 'react';
import { CabecaDaTela } from './comum';
import { Icone } from './icones';

/* =========================================================================
   O MANUAL (/admin/manual)

   As mesmas dez seções do ar, na mesma ordem, com o índice no alto e o
   "Voltar ao Dashboard". O que mudou é o texto, que estava atrasado em
   relação à tela:
   - o editor tem Título 2, 3 e 4 (o manual falava de H1);
   - a capa aparece em quadrado no blog novo (o manual pedia 1200x630,
     que é a medida da imagem das redes, a OG);
   - não existe "Selecionar Imagem": é arrastar ou clicar no quadro;
   - o Dashboard tem quatro números (o manual listava seis);
   - entram o Agendado, as Tags com busca, o Ctrl+S e o aviso de
     alterações não salvas, que são da tela de hoje.
   E o texto ganhou os acentos. O índice continua no alto, agora em duas
   colunas, e o texto tem a largura de leitura do artigo do blog.
   ========================================================================= */

type Secao = { id: string; titulo: string; corpo: ReactNode };

const Tecla = ({ children }: { children: ReactNode }) => <kbd className="adm-tecla">{children}</kbd>;
const Dica = ({ titulo, children, atencao }: { titulo: string; children: ReactNode; atencao?: boolean }) => (
  <aside className="adm-dica" data-atencao={atencao ? '' : undefined}>
    <Icone nome={atencao ? 'aviso' : 'raio'} tamanho={18} />
    <div><b>{titulo}</b><p>{children}</p></div>
  </aside>
);

const SECOES: Secao[] = [
  {
    id: 'dashboard', titulo: 'Dashboard',
    corpo: <>
      <p>A primeira tela do painel. Mostra o resumo do blog em quatro números:</p>
      <ul>
        <li><b>Total de Posts:</b> tudo o que existe, publicado ou não.</li>
        <li><b>Publicados:</b> o que está no ar.</li>
        <li><b>Rascunhos:</b> o que ainda não saiu. Fica em âmbar quando tem algum esperando.</li>
        <li><b>Visualizações:</b> a soma das leituras de todos os posts.</li>
      </ul>
      <p>Embaixo, os cinco posts mais recentes e as Ações Rápidas: Novo Post, Categorias, Autores e Ver Blog.</p>
    </>,
  },
  {
    id: 'primeiro-post', titulo: 'Criando seu primeiro post',
    corpo: <>
      <ol>
        <li>Clique em <b>Novo Post</b>, no menu da esquerda ou no botão laranja do Dashboard.</li>
        <li>Escreva o <b>título</b> no alto da folha.</li>
        <li>Escreva o <b>conteúdo</b> no editor, logo abaixo.</li>
        <li>Preencha o <b>Resumo</b>: é o que aparece na listagem do blog.</li>
        <li>Na coluna da direita, escolha a <b>Imagem de Capa</b>, a <b>Categoria</b> e as <b>Tags</b>.</li>
        <li>Abra o <b>SEO</b> e confira o que vai aparecer no Google.</li>
        <li>Clique em <b>Salvar Rascunho</b> para continuar depois, ou em <b>Publicar</b>.</li>
      </ol>
      <Dica titulo="O editor não salva sozinho">
        Salve de vez em quando com <Tecla>Ctrl</Tecla> <Tecla>S</Tecla>. Enquanto houver coisa por salvar, a caixa Publicar mostra
        &quot;Alterações não salvas&quot;, e o navegador pergunta antes de sair da página.
      </Dica>
    </>,
  },
  {
    id: 'editor', titulo: 'Usando o editor de texto',
    corpo: <>
      <p>A barra fica presa no alto enquanto você escreve. Selecione o texto e clique no botão; clique de novo para tirar.</p>
      <div className="adm-tabela-rolagem">
        <table className="adm-tabela adm-tabela-manual">
          <thead><tr><th scope="col">Botão</th><th scope="col">O que faz</th><th scope="col">Atalho</th></tr></thead>
          <tbody>
            <tr><td><b>B</b></td><td>Negrito, para a palavra que importa</td><td><Tecla>Ctrl</Tecla> <Tecla>B</Tecla></td></tr>
            <tr><td><i>I</i></td><td>Itálico</td><td><Tecla>Ctrl</Tecla> <Tecla>I</Tecla></td></tr>
            <tr><td><u>U</u></td><td>Sublinhado</td><td><Tecla>Ctrl</Tecla> <Tecla>U</Tecla></td></tr>
            <tr><td><s>S</s></td><td>Tachado</td><td></td></tr>
            <tr><td>H2, H3, H4</td><td>Intertítulos, do maior para o menor. O título do post já é o maior da página.</td><td></td></tr>
            <tr><td>Listas</td><td>Com marcadores ou numerada</td><td></td></tr>
            <tr><td>Citação</td><td>A frase em destaque</td><td></td></tr>
            <tr><td>Código</td><td>Bloco de código, para post técnico</td><td></td></tr>
            <tr><td>Imagem, Vídeo</td><td>Inserem no ponto onde está o cursor</td><td></td></tr>
            <tr><td>Link</td><td>Liga o texto selecionado a um endereço</td><td><Tecla>Ctrl</Tecla> <Tecla>K</Tecla></td></tr>
            <tr><td>Desfazer, Refazer</td><td></td><td><Tecla>Ctrl</Tecla> <Tecla>Z</Tecla> / <Tecla>Ctrl</Tecla> <Tecla>Y</Tecla></td></tr>
          </tbody>
        </table>
      </div>
    </>,
  },
  {
    id: 'imagens', titulo: 'Inserindo imagens',
    corpo: <>
      <h3>Imagem de capa</h3>
      <p>A imagem principal do post: aparece na listagem do blog e na abertura do artigo, <b>em quadrado</b>. Arraste a imagem para o quadro
        ou clique nele para escolher. Para trocar, passe o mouse e clique em <b>Trocar</b>.</p>
      <p>Embaixo, os <b>Créditos da imagem</b>: o nome do fotógrafo ou da fonte e, se quiser, o link (aí o crédito vira clicável).</p>
      <h3>Imagem no texto</h3>
      <ol>
        <li>Ponha o cursor onde a imagem deve entrar.</li>
        <li>Clique no botão de imagem da barra.</li>
        <li>Arraste a imagem para a janela ou clique para escolher, e clique em <b>Inserir</b>.</li>
      </ol>
      <Dica titulo="Peso e direito de uso">
        PNG, JPG, GIF ou WebP, até 10 MB. Quanto menor o arquivo, mais rápido o post abre. Use só imagem que você tem direito de usar, e dê o crédito.
      </Dica>
    </>,
  },
  {
    id: 'videos', titulo: 'Inserindo vídeos',
    corpo: <>
      <ol>
        <li>Ponha o cursor onde o vídeo deve entrar.</li>
        <li>Clique no botão de vídeo da barra.</li>
        <li>Cole o endereço do vídeo. Servem <code>youtube.com/watch?v=...</code>, <code>youtu.be/...</code> e os do Vimeo.</li>
        <li>Quando o endereço é válido, a prévia aparece. Clique em <b>Inserir</b>.</li>
      </ol>
      <p>O leitor assiste sem sair do blog.</p>
    </>,
  },
  {
    id: 'seo', titulo: 'Configurações de SEO',
    corpo: <>
      <p>O SEO ajuda o post a aparecer bem no Google. Os campos ficam embaixo do Resumo, no quadro que abre e fecha.</p>
      <ul>
        <li><b>Palavra-chave principal:</b> a frase que o post quer ranquear. Use ela com naturalidade no título, no resumo e no texto.</li>
        <li><b>Meta Title:</b> o título que aparece no Google. Vazio, vale o título do post. Até 60 caracteres: o contador fica âmbar quando passa.</li>
        <li><b>Meta Description:</b> o texto embaixo do título no Google. Até 160 caracteres.</li>
        <li><b>URL/Slug:</b> o endereço do post. Nasce do título; só letra minúscula, número e hífen.</li>
      </ul>
      <p>O <b>Preview do Google</b> mostra como o post vai aparecer na busca, enquanto você escreve.</p>
    </>,
  },
  {
    id: 'publicar', titulo: 'Salvando e publicando',
    corpo: <>
      <p>Tudo fica na caixa <b>Publicar</b>, no alto da coluna da direita.</p>
      <ul>
        <li><b>Salvar Rascunho:</b> guarda sem publicar. Só aparece no painel.</li>
        <li><b>Publicar:</b> põe no ar na hora, para todo mundo. Na edição, o botão se chama <b>Atualizar</b>.</li>
        <li><b>Agendado:</b> escolha Agendado no Status, a data aparece logo abaixo, e o botão vira <b>Agendar</b>.</li>
        <li><b>Destacar post:</b> o post entra nos destaques da página inicial do blog.</li>
        <li><b>Divulgar nas redes sociais:</b> marca o post para a divulgação nas redes da Tribhus.</li>
      </ul>
    </>,
  },
  {
    id: 'posts', titulo: 'Gerenciando posts',
    corpo: <>
      <p>Em <b>Posts</b> estão todos os posts do blog, vinte por página. Para achar um: a busca pelo título, o filtro de status
        (Publicados, Rascunhos, Agendados) e o de categoria, e <b>Buscar</b>.</p>
      <p>Em cada linha, da esquerda para a direita:</p>
      <ul>
        <li><b>Publicar</b> ou <b>Despublicar</b>: despublicado, o post vira rascunho e sai do blog.</li>
        <li><b>Editar.</b></li>
        <li><b>Ver no blog</b>, só nos publicados.</li>
        <li><b>Excluir</b>, que pergunta antes. Não dá para desfazer.</li>
      </ul>
    </>,
  },
  {
    id: 'categorias', titulo: 'Categorias',
    corpo: <>
      <p>As categorias organizam o blog. Todo post deve ter uma.</p>
      <ol>
        <li>Abra <b>Categorias</b> no menu e clique em <b>Nova Categoria</b>.</li>
        <li>Escreva o nome. O slug nasce dele.</li>
        <li>Se quiser, uma descrição, e escolha a cor.</li>
        <li>Clique em <b>Criar</b>.</li>
      </ol>
      <Dica titulo="Categoria com post não se exclui" atencao>
        Mude os posts para outra categoria antes. O painel avisa quando for o caso.
      </Dica>
    </>,
  },
  {
    id: 'autores', titulo: 'Autores',
    corpo: <>
      <p>Quem escreve no blog. Só administrador cria autor.</p>
      <ul>
        <li><b>Nome, Slug e Email:</b> o email é o login do painel.</li>
        <li><b>Senha:</b> obrigatória no Novo Autor. No Editar, digite uma nova para trocar, ou deixe vazio para manter a atual.</li>
        <li><b>Bio e Avatar:</b> o perfil do autor.</li>
        <li><b>Administrador:</b> entra no painel e mexe em tudo.</li>
        <li><b>Autor IA:</b> assina os artigos que a IA escreve.</li>
      </ul>
      <Dica titulo="Autor com post publicado não se exclui" atencao>
        Passe os posts para outro autor antes.
      </Dica>
    </>,
  },
];

export function Manual() {
  return (
    <div className="adm-manual">
      <CabecaDaTela titulo="Manual do Painel Administrativo" sub="Guia completo para gerenciar o Tribhus Blog"
        voltar={<Link className="adm-bt-ic" href="/admin" aria-label="Voltar ao Dashboard" title="Voltar ao Dashboard"><Icone nome="voltar" /></Link>} />
      <div className="adm-manual-grade">
        <nav className="adm-quadro adm-manual-indice" aria-label="Índice do manual">
          <p className="adm-rotulo">Índice</p>
          <ol>
            {SECOES.map((s, i) => <li key={s.id}><a href={`#${s.id}`}><span>{i + 1}</span>{s.titulo}</a></li>)}
          </ol>
        </nav>
        <div className="adm-manual-texto">
          {SECOES.map((s, i) => (
            <section key={s.id} id={s.id} className="adm-quadro adm-manual-secao">
              <h2><span>{String(i + 1).padStart(2, '0')}</span>{s.titulo}</h2>
              {s.corpo}
            </section>
          ))}
          <div className="adm-quadro adm-manual-ajuda">
            <b>Precisa de ajuda?</b>
            <p>Se tiver dúvida ou achar um problema, fale com o suporte técnico da Tribhus.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
