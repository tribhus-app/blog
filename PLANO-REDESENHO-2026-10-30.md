# Redesenho do blog e do painel (pacote do Dione, 30/10/2026)

Recebido pelo WhatsApp (instância pessoal, contato 34 99662-7386) em 30/10/2026 às 16:20:
`2026-10-30-blog-completo.zip`, cópia em `/opt/backups/tribhus-blog-completo-2026-10-30.zip`.
Textos que mandam no pacote: `BLOG-AGENTS.md`, `BLOG-LEIA-PRIMEIRO.md`,
`BLOG-PAINEL-AGENTS.md`, `BLOG-PAINEL-LEIA-PRIMEIRO.md`, `LEIA-ESTE-ENVIO.md`.
Mesmo método das telas do site (`/opt/tribhus_next/PLANO-*.md`).

## ▶ ONDE PARAMOS

**NO AR desde 31/10/2026 às 08:43** (subido pelo William). Conferido logo depois: capa, artigo,
categoria, tag, busca e login em 200, `/blog/nao-existe` em 404, `/authors` sem e-mail e sem
`isAdmin`, `status=all` sem rascunho, visita voltou a ser gravada (POST `/blog/api/.../view` 200 e
1 registro no banco), nenhuma foto quebrada, log limpo. Nada commitado.

📨 Dione avisado pelo WhatsApp em 31/10 (`/opt/scripts/msg-dione-blog-31102026.txt`), junto com a correção da API das bandas no backend da Tribhus (`/bands/banda/:id` só entrega CNPJ, responsável e contato à própria banda logada).

⏳ Falta conferir no ar com login de verdade: salvar, publicar, excluir, upload e gerar com IA.

Comando usado (frontend da imagem testada `teste-redesenho`, backend recompilado):

```bash
cd /opt/tribhus_blog && docker tag tribhus_blog-frontend:latest tribhus_blog-frontend:antes-redesenho && docker tag tribhus_blog-backend:latest tribhus_blog-backend:antes-redesenho && docker tag tribhus_blog-frontend:teste-redesenho tribhus_blog-frontend:latest && docker compose build backend && docker compose up -d --force-recreate --no-deps frontend backend
```

Volta: `docker tag tribhus_blog-frontend:antes-redesenho tribhus_blog-frontend:latest`, o mesmo
para o `backend`, e `docker compose up -d --force-recreate --no-deps frontend backend`.

Depois de subir, conferir: `/blog`, um artigo, `/blog/nao-existe` (404), entrar no
`/blog/admin`, e no dia seguinte se o Analytics voltou a contar visita.

## Conserto do Dione (31/10/2026, 12:47)

`2026-10-31-conserto-blog.zip`, cópia em `/opt/backups/tribhus-blog-conserto-2026-10-31.zip`.
Responde às duas diferenças avisadas a ele:

1. **"Ouça enquanto lê" toca ali na matéria**, com um `<audio>` próprio (o blog não tem o player do
   site). A faixa é a primeira com áudio do disco mais novo (`components/blog/faixaDaBanda.ts`),
   com os discos de `/bands/public/albuns/:id` e as faixas de `/bands/public/album-tracks/:id`,
   os mesmos da página da banda (`lib/blog.ts`, `faixaDe`). O tipo `FaixaParaTocar` mora em
   `components/blog/tipos.ts`, porque o blog não tem o `disco/tocador.ts`.
2. **H1 da tag é só o nome** (`<h1 data-prefixo="#">metal</h1>`); o "#" vem do CSS.
3. Moldura em volta do bloco saiu (o fio de luz fica só na capa).
4. Painel: o campo de login com senha salva não fica mais azul.

**NO AR desde 31/10/2026 (tarde)**, volta: `docker tag tribhus_blog-frontend:antes-conserto tribhus_blog-frontend:latest` e recriar o `frontend`. Conferido no ar e antes em imagem `teste-conserto`: play e pausa em 1440 e 390 (Undersiege, "90 Seconds to
Armageddon"), sem erro de página, H1 da tag com o texto `metal` e a tela mostrando `#METAL`.
🪤 As faixas são `.m4a` (AAC): o Chromium do Playwright não toca AAC e dá "falhou". Testar com
`channel: 'chrome'`.

## Fotos do tempo do WordPress (31/10/2026)

17 artigos publicados tinham 18 fotos no texto apontando para `blog.tribhus.com/wp-content/uploads/`,
que hoje cai na Locaweb: foto quebrada para o leitor (antes e depois do redesenho). Os arquivos
estavam no backup do WordPress (`/opt/tribhus_blog/blog tribhus/uploads/`). Subidos ao MinIO do blog
em `wp-uploads/<ano>/<mes>/<arquivo>` (servidos em `https://tribhus.com/blog/minio-images/wp-uploads/`)
e o endereço trocado no texto, com o OK do William. Texto original dos 17 em
`/opt/backups/tribhus-blog-posts-fotos-wp-antes-20261031_103340.json`. Conferido no ar: 17
páginas, nenhuma foto quebrada. Nenhum artigo ficou com o domínio velho.

## Segurança (backend), corrigido junto

1. `GET /blog/api/authors` mostrava a qualquer pessoa o e-mail dos 5 autores e o `isAdmin`.
   Aviso do Dione. Agora só com token de administrador (`pedidoDeAdmin`, em
   `backend/src/middlewares/auth.ts`). O painel manda o token e continua vendo.
2. `GET /blog/api/posts?status=all` devolvia rascunho e agendado a qualquer pessoa (2 rascunhos
   em 31/10). Achado nesta leva. Agora `all` só vale para administrador.

## Defeito do ar achado nesta leva: o blog não contava visita desde 22/10

O `ViewTracker` mandava para `/api/posts/...`. Com o blog em `tribhus.com/blog` (22/10) esse
caminho cai no site e dá 404. O banco tem visita todo dia até 22/10 e nenhuma de 23 a 31/10.
Corrigido para `/blog/api/...`. Os 9 dias perdidos não voltam.

## Como foi ligado

- **Next 14 e React 18 ficaram.** O exemplo do pacote é Next 15 / React 19; subir o framework
  mudaria o cache das páginas. Ajustes por isso: `inert` (helper `components/casa/inerte.ts`),
  `params` sem Promise, nada de `<link>` no corpo, `usePathname` sem o `/blog`.
- **Dados:** `src/lib/blog.ts` (público) e `src/lib/painel.ts` / `painel-servidor.ts` (painel).
  Nenhum endpoint novo. Os metadados e o JSON-LD de cada página são os do ar (comparados rota a
  rota com o ar: idênticos, menos o H1 da tag, abaixo).
- **Markdown dos artigos antigos:** `marked` + a sanitização do ar (CRIT-010, DOMPurify) antes
  do `prepararCorpo` do pacote. Conferido contra os 43 artigos que o Dione converteu: 43 iguais.
- **CSS:** `src/styles/casa/` com 01-tokens e 02-casca **do site**, 35-blog e 36-blog-admin do
  pacote, e `99-blog.css` (fontes da casa e a regra `.so-leitor`).
- **Peças da casa** que o blog não enxerga no site (dependem do login e das traduções de lá):
  cópias em `src/components/casa/` (menu do celular, visor sem a conversa, índice, play).
- **Painel:** ligado por um agente; leitura no servidor pelo cookie `admin_token`, login fora da
  casca (grupo `(painel)`), rota `/admin/sair` para apagar o cookie. TipTap mantido, com a barra
  do pacote (`EditorDoPost.tsx`). O painel antigo foi apagado (está no git).

## Diferenças do pacote (decididas)

1. **Ficaram três coisas do ar que o pacote não trazia:** o contador de visitas, os relacionados
   pelo endpoint de 20/10 (`/posts/:id/related`, tag em comum) e o convite dos posts-guia para o
   catálogo de gênero (agora na caixa "Descubra na Tribhus", no alto do texto).
2. **Foto de cada categoria na capa:** o artigo mais novo de cada uma (1 pedido por categoria).
   Só com os 10 da capa, 6 das 8 categorias ficavam sem foto.
3. **"Ouça enquanto lê"** sem a faixa tocando: a ficha leva à banda (o pacote prevê). Até 6
   bandas por artigo, pela API da Tribhus (`/bands/public/get-band-id` + `/bands/banda/:id`).
4. **H1 da tag** passa a ter o "#" (marcado para leitor de tela ignorar); no ar o "#" ficava fora.
5. **Painel:** imagem OG saiu (a API não tem o campo); senha de autor só no Novo Autor (a API não
   troca senha); slug da categoria só leitura (a API gera pelo nome); data do Agendado no horário
   local (o ar mostrava UTC, 3 h adiantado); gráfico do post sem a linha de únicos.

## Decidido pelo William (31/10/2026)

1. **Autor ao editar:** continua o original (como o painel novo já faz).
2. **Geração manual com IA:** não é mais usada; a lista de categorias fica como está.
3. **Criar tag e trocar senha:** feitas no backend, só para administrador.
   - `POST /tags { name }` (`backend/src/routes/tags.ts`): o slug sai do nome; se já existe tag com
     o mesmo slug, devolve a que existe (200), senão cria (201).
   - `PUT /authors/:id` aceita `password`: vazia ou ausente mantém a atual, menos de 6 caracteres
     recusa. No painel, o Editar Autor mostra "Nova senha" com "Deixe vazio para manter a senha
     atual" (`Autores.tsx`, `acoes.ts`, `Manual.tsx`).
   - Testado numa cópia do backend na porta 3011 contra o banco real, com autor e tag de teste
     apagados no fim: sem login 401, tag criada e repetida devolvendo a mesma, senha curta
     recusada, editar sem senha mantém, senha trocada entra e a antiga dá 401.
   - 🪤 O `docker compose build backend` substituiu a imagem que estava rodando, então não há tag
     `antes-rotas` do backend: para voltar, desfazer os dois arquivos de rota e recompilar.
4. A API das bandas (`/bands/banda/:id`) já foi corrigida no backend da Tribhus em 31/10.

## Provas

Pasta `/tmp/claude-0/-opt/f5b08876-3617-4fa8-8047-a8734a994594/scratchpad/`: `shots/` (todas as
telas em 1440 e 390, painel com sessão de admin real e escrita bloqueada no navegador),
`scripts/telas.cjs`, `cliques.cjs`, `painel.cjs`, `conferir-md.cjs`.
- 21 rotas públicas: status certo (404 onde é 404), sem rolagem lateral, sem foto quebrada.
- Copiar link, vídeo no toque, índice, busca por "/" e Esc, visor de fotos, paginação com
  `rel=prev/next`, menu do celular: conferidos.
- Painel: as 10 telas em 200 nos dois tamanhos, sem erro de página; sem sessão vai para o login.
- Sitemap: 462 endereços, igual ao ar.
- Não conferido: salvar, publicar, excluir, upload e gerar com IA (gravariam no banco real).
