'use client'

import Link from 'next/link'

export default function ManualPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-text-muted hover:text-white transition-colors text-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar ao Dashboard
        </Link>
      </div>

      <div className="bg-dark-card border border-border rounded-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Manual do Painel Administrativo</h1>
        <p className="text-text-muted mb-8">Guia completo para gerenciar o Tribhus Blog</p>

        {/* Índice */}
        <div className="bg-dark border border-border rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Indice</h2>
          <ul className="space-y-2 text-text-secondary">
            <li><a href="#dashboard" className="hover:text-primary transition-colors">1. Dashboard</a></li>
            <li><a href="#criar-post" className="hover:text-primary transition-colors">2. Criando seu Primeiro Post</a></li>
            <li><a href="#editor" className="hover:text-primary transition-colors">3. Usando o Editor de Texto</a></li>
            <li><a href="#imagens" className="hover:text-primary transition-colors">4. Inserindo Imagens</a></li>
            <li><a href="#videos" className="hover:text-primary transition-colors">5. Inserindo Videos do YouTube</a></li>
            <li><a href="#seo" className="hover:text-primary transition-colors">6. Configuracoes de SEO</a></li>
            <li><a href="#publicar" className="hover:text-primary transition-colors">7. Salvando e Publicando</a></li>
            <li><a href="#gerenciar-posts" className="hover:text-primary transition-colors">8. Gerenciando Posts</a></li>
            <li><a href="#categorias" className="hover:text-primary transition-colors">9. Categorias</a></li>
            <li><a href="#autores" className="hover:text-primary transition-colors">10. Autores</a></li>
          </ul>
        </div>

        {/* 1. Dashboard */}
        <section id="dashboard" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">1</span>
            Dashboard
          </h2>
          <div className="text-text-secondary space-y-4">
            <p>
              O Dashboard e a tela inicial do painel administrativo. Aqui voce encontra um resumo
              rapido de todas as informacoes do blog:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Total de Posts:</strong> Quantidade total de posts no blog</li>
              <li><strong className="text-white">Publicados:</strong> Posts que estao visiveis no blog</li>
              <li><strong className="text-white">Rascunhos:</strong> Posts salvos mas nao publicados</li>
              <li><strong className="text-white">Visualizacoes:</strong> Total de acessos aos posts</li>
              <li><strong className="text-white">Categorias:</strong> Numero de categorias cadastradas</li>
              <li><strong className="text-white">Autores:</strong> Numero de autores no sistema</li>
            </ul>
            <p>
              Use os botoes de acao rapida para criar novos posts ou acessar outras secoes do admin.
            </p>
          </div>
        </section>

        {/* 2. Criando Post */}
        <section id="criar-post" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">2</span>
            Criando seu Primeiro Post
          </h2>
          <div className="text-text-secondary space-y-4">
            <p>Para criar um novo post, siga os passos:</p>

            <div className="bg-dark border border-border rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Passo a Passo:</h4>
              <ol className="list-decimal list-inside space-y-3">
                <li>Clique em <strong className="text-primary">«Novo Post»</strong> no menu lateral ou no Dashboard</li>
                <li>Preencha o <strong className="text-white">Titulo</strong> do post (obrigatorio)</li>
                <li>Escreva um <strong className="text-white">Resumo</strong> curto (aparece na listagem do blog)</li>
                <li>Selecione uma <strong className="text-white">Categoria</strong></li>
                <li>Adicione uma <strong className="text-white">Imagem de Capa</strong> (recomendado: 1200x630px)</li>
                <li>Escreva o <strong className="text-white">Conteudo</strong> do post no editor</li>
                <li>Configure o <strong className="text-white">SEO</strong> (opcional mas recomendado)</li>
                <li>Clique em <strong className="text-primary">«Salvar Rascunho»</strong> ou <strong className="text-accent-green">«Publicar»</strong></li>
              </ol>
            </div>

            <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg p-4">
              <p className="text-accent-yellow font-medium mb-2">Dica Importante:</p>
              <p className="text-text-secondary">
                Sempre salve seu trabalho como rascunho periodicamente para nao perder o conteudo.
                Voce pode continuar editando depois e publicar quando estiver pronto.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Editor */}
        <section id="editor" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">3</span>
            Usando o Editor de Texto
          </h2>
          <div className="text-text-secondary space-y-4">
            <p>
              O editor de texto e onde voce escreve o conteudo do post. Ele possui uma barra de
              ferramentas com diversos recursos de formatacao:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border border-border rounded-lg overflow-hidden">
                <thead className="bg-dark">
                  <tr>
                    <th className="text-left px-4 py-3 text-white font-medium">Botao</th>
                    <th className="text-left px-4 py-3 text-white font-medium">Funcao</th>
                    <th className="text-left px-4 py-3 text-white font-medium">Atalho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-bold">B</td>
                    <td className="px-4 py-3">Negrito - destaca palavras importantes</td>
                    <td className="px-4 py-3"><code className="bg-dark px-2 py-1 rounded">Ctrl+B</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 italic">I</td>
                    <td className="px-4 py-3">Italico - enfase suave no texto</td>
                    <td className="px-4 py-3"><code className="bg-dark px-2 py-1 rounded">Ctrl+I</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 underline">U</td>
                    <td className="px-4 py-3">Sublinhado</td>
                    <td className="px-4 py-3"><code className="bg-dark px-2 py-1 rounded">Ctrl+U</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">H1, H2, H3</td>
                    <td className="px-4 py-3">Titulos e subtitulos (organize seu texto)</td>
                    <td className="px-4 py-3">-</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Lista</td>
                    <td className="px-4 py-3">Lista com marcadores</td>
                    <td className="px-4 py-3">-</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Lista Num.</td>
                    <td className="px-4 py-3">Lista numerada</td>
                    <td className="px-4 py-3">-</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Citacao</td>
                    <td className="px-4 py-3">Bloco de citacao (frases de destaque)</td>
                    <td className="px-4 py-3">-</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Codigo</td>
                    <td className="px-4 py-3">Bloco de codigo (para posts tecnicos)</td>
                    <td className="px-4 py-3">-</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Link</td>
                    <td className="px-4 py-3">Inserir link em texto selecionado</td>
                    <td className="px-4 py-3"><code className="bg-dark px-2 py-1 rounded">Ctrl+K</code></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Imagem</td>
                    <td className="px-4 py-3">Inserir imagem no texto</td>
                    <td className="px-4 py-3">-</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">Video</td>
                    <td className="px-4 py-3">Inserir video do YouTube/Vimeo</td>
                    <td className="px-4 py-3">-</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4">
              <p className="text-accent-blue font-medium mb-2">Como formatar texto:</p>
              <p className="text-text-secondary">
                Selecione o texto que deseja formatar e clique no botao correspondente.
                Para remover a formatacao, selecione novamente e clique no mesmo botao.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Imagens */}
        <section id="imagens" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">4</span>
            Inserindo Imagens
          </h2>
          <div className="text-text-secondary space-y-4">
            <p>Existem duas formas de adicionar imagens ao seu post:</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark border border-border rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Imagem de Capa</h4>
                <p className="text-sm mb-3">
                  E a imagem principal do post, que aparece na listagem do blog e no topo do artigo.
                </p>
                <ul className="text-sm space-y-2">
                  <li>- Clique em «Selecionar Imagem» no campo de capa</li>
                  <li>- Escolha uma imagem do seu computador</li>
                  <li>- Tamanho recomendado: <strong className="text-white">1200x630 pixels</strong></li>
                  <li>- Formatos: JPG, PNG, WebP</li>
                </ul>
              </div>

              <div className="bg-dark border border-border rounded-lg p-4">
                <h4 className="text-white font-medium mb-3">Imagens no Texto</h4>
                <p className="text-sm mb-3">
                  Voce pode inserir imagens em qualquer parte do conteudo.
                </p>
                <ul className="text-sm space-y-2">
                  <li>1. Posicione o cursor onde quer a imagem</li>
                  <li>2. Clique no botao de <strong className="text-white">Imagem</strong> na barra</li>
                  <li>3. Faca upload ou cole uma URL</li>
                  <li>4. A imagem sera inserida no local</li>
                </ul>
              </div>
            </div>

            <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg p-4">
              <p className="text-accent-green font-medium mb-2">Dicas para imagens:</p>
              <ul className="text-text-secondary text-sm space-y-1">
                <li>- Use imagens de boa qualidade mas otimizadas (max 2MB)</li>
                <li>- Prefira formato WebP para melhor performance</li>
                <li>- Imagens muito grandes podem deixar o site lento</li>
                <li>- Sempre use imagens que voce tem direito de usar</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Videos */}
        <section id="videos" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">5</span>
            Inserindo Videos do YouTube
          </h2>
          <div className="text-text-secondary space-y-4">
            <p>
              Voce pode incorporar videos do YouTube diretamente no seu post. O video
              aparecera embutido e os leitores poderao assistir sem sair do blog.
            </p>

            <div className="bg-dark border border-border rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Como inserir um video:</h4>
              <ol className="list-decimal list-inside space-y-3">
                <li>Posicione o cursor no local onde deseja o video</li>
                <li>Clique no botao de <strong className="text-white">Video</strong> (icone de play) na barra de ferramentas</li>
                <li>Cole a URL completa do video do YouTube</li>
                <li>
                  Exemplos de URLs aceitas:
                  <ul className="ml-6 mt-2 space-y-1 text-sm">
                    <li><code className="bg-dark-card px-2 py-1 rounded">https://www.youtube.com/watch?v=XXXXX</code></li>
                    <li><code className="bg-dark-card px-2 py-1 rounded">https://youtu.be/XXXXX</code></li>
                  </ul>
                </li>
                <li>Clique em Inserir e o video aparecera no editor</li>
              </ol>
            </div>

            <div className="bg-accent-purple/10 border border-accent-purple/20 rounded-lg p-4">
              <p className="text-accent-purple font-medium mb-2">Tambem funciona com Vimeo:</p>
              <p className="text-text-secondary text-sm">
                Alem do YouTube, voce pode inserir videos do Vimeo usando a mesma funcionalidade.
                Basta colar a URL do video do Vimeo.
              </p>
            </div>
          </div>
        </section>

        {/* 6. SEO */}
        <section id="seo" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">6</span>
            Configuracoes de SEO
          </h2>
          <div className="text-text-secondary space-y-4">
            <p>
              SEO (Search Engine Optimization) ajuda seu post a aparecer melhor nos resultados
              de busca do Google. Configure esses campos para otimizar seu conteudo:
            </p>

            <div className="space-y-4">
              <div className="bg-dark border border-border rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Titulo SEO</h4>
                <p className="text-sm">
                  E o titulo que aparece nos resultados do Google. Se nao preenchido, usa o titulo do post.
                </p>
                <p className="text-xs text-text-muted mt-2">Maximo recomendado: 60 caracteres</p>
              </div>

              <div className="bg-dark border border-border rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Descricao SEO</h4>
                <p className="text-sm">
                  E o texto que aparece abaixo do titulo no Google. Deve ser atrativo para
                  fazer as pessoas clicarem.
                </p>
                <p className="text-xs text-text-muted mt-2">Maximo recomendado: 160 caracteres</p>
              </div>

              <div className="bg-dark border border-border rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Palavra-chave Foco</h4>
                <p className="text-sm">
                  A palavra ou frase principal que voce quer que o post ranqueie.
                  Use naturalmente no titulo, resumo e conteudo.
                </p>
              </div>
            </div>

            <div className="bg-dark border border-border rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Preview do Google</h4>
              <p className="text-sm mb-4">
                O painel de SEO mostra uma previa de como seu post aparecera no Google.
                Use isso para ajustar o titulo e descricao ate ficarem atrativos.
              </p>
              <div className="bg-white rounded-lg p-4">
                <p className="text-[#1a0dab] text-lg">Titulo do Seu Post Aparece Aqui</p>
                <p className="text-[#006621] text-sm">https://blog.tribhus.com.br/seu-post</p>
                <p className="text-[#545454] text-sm">A descricao do post aparece aqui. Ela deve ser interessante e convidar o leitor a clicar...</p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Publicar */}
        <section id="publicar" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">7</span>
            Salvando e Publicando
          </h2>
          <div className="text-text-secondary space-y-4">
            <p>Existem duas opcoes para salvar seu post:</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-dark border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-text-muted/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">Salvar Rascunho</h4>
                </div>
                <p className="text-sm">
                  Salva o post sem publicar. Ele fica visivel apenas no painel admin.
                  Use para salvar seu trabalho e continuar depois.
                </p>
              </div>

              <div className="bg-dark border border-accent-green/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-white font-medium">Publicar</h4>
                </div>
                <p className="text-sm">
                  Publica o post imediatamente. Ele ficara visivel no blog para todos
                  os visitantes. Certifique-se de revisar antes!
                </p>
              </div>
            </div>

            <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg p-4">
              <p className="text-accent-yellow font-medium mb-2">Opcao de Post Destacado:</p>
              <p className="text-text-secondary text-sm">
                Marque a opcao «Post em Destaque» para que o post apareca na secao de
                destaques na pagina inicial do blog.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Gerenciar Posts */}
        <section id="gerenciar-posts" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">8</span>
            Gerenciando Posts
          </h2>
          <div className="text-text-secondary space-y-4">
            <p>
              Na secao «Posts» voce encontra todos os posts do blog. Use os filtros para encontrar
              posts especificos:
            </p>

            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-white">Filtrar por Status:</strong> Todos, Publicados, Rascunhos, Agendados</li>
              <li><strong className="text-white">Filtrar por Categoria:</strong> Selecione uma categoria especifica</li>
              <li><strong className="text-white">Buscar:</strong> Pesquise pelo titulo do post</li>
            </ul>

            <div className="bg-dark border border-border rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Acoes disponiveis em cada post:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span><strong>Publicar:</strong> Torna o post visivel</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span><strong>Despublicar:</strong> Remove do blog</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span><strong>Editar:</strong> Abre o editor</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span><strong>Ver no blog:</strong> Abre o post publicado</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span><strong>Excluir:</strong> Remove permanentemente</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Categorias */}
        <section id="categorias" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">9</span>
            Categorias
          </h2>
          <div className="text-text-secondary space-y-4">
            <p>
              As categorias ajudam a organizar os posts do blog. Cada post deve ter uma categoria.
            </p>

            <div className="bg-dark border border-border rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Para criar uma nova categoria:</h4>
              <ol className="list-decimal list-inside space-y-2">
                <li>Acesse «Categorias» no menu lateral</li>
                <li>Clique em «Nova Categoria»</li>
                <li>Preencha o nome da categoria</li>
                <li>Adicione uma descricao (opcional)</li>
                <li>Escolha uma cor para identificacao</li>
                <li>Clique em «Salvar»</li>
              </ol>
            </div>

            <p>
              O slug (URL amigavel) e gerado automaticamente a partir do nome.
              Voce pode editar ou excluir categorias existentes, mas categorias com
              posts nao podem ser excluidas.
            </p>
          </div>
        </section>

        {/* 10. Autores */}
        <section id="autores" className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-sm">10</span>
            Autores
          </h2>
          <div className="text-text-secondary space-y-4">
            <p>
              Gerencie os autores que podem criar posts no blog. Apenas administradores
              podem criar novos autores.
            </p>

            <div className="bg-dark border border-border rounded-lg p-4">
              <h4 className="text-white font-medium mb-3">Campos do autor:</h4>
              <ul className="space-y-2">
                <li><strong className="text-white">Nome:</strong> Nome que aparece nos posts</li>
                <li><strong className="text-white">Email:</strong> Usado para login (unico)</li>
                <li><strong className="text-white">Senha:</strong> Para acesso ao painel</li>
                <li><strong className="text-white">Bio:</strong> Descricao curta do autor</li>
                <li><strong className="text-white">Avatar:</strong> Foto do autor</li>
                <li><strong className="text-white">Administrador:</strong> Se marcado, pode gerenciar outros autores</li>
              </ul>
            </div>

            <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4">
              <p className="text-accent-red font-medium mb-2">Atencao:</p>
              <p className="text-text-secondary text-sm">
                Autores que possuem posts publicados nao podem ser excluidos.
                Primeiro voce precisa transferir ou excluir os posts desse autor.
              </p>
            </div>
          </div>
        </section>

        {/* Rodapé */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center">
            <h3 className="text-white font-semibold mb-2">Precisa de ajuda?</h3>
            <p className="text-text-secondary text-sm">
              Se tiver duvidas ou encontrar problemas, entre em contato com o suporte tecnico.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
