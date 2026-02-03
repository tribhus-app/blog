# Projeto Blog Tribhus

## Visao Geral

Blog de noticias, novidades, lancamentos e releases do mundo do rock underground e independente, integrado a plataforma Tribhus.

**Dominio:** blog.tribhus.com.br
**IP Exclusivo:** 187.45.185.92
**Localizacao:** /opt/tribhus_blog
**Stack:** Next.js 14 + Express.js + PostgreSQL

---

## Stack Tecnologica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 14 (App Router) |
| Estilizacao | Tailwind CSS |
| Backend API | Express.js (porta 3001) |
| Banco de Dados | PostgreSQL (existente) |
| ORM | Prisma |
| Autenticacao Admin | JWT |
| Storage Imagens | Local/S3 (mesmo do Tribhus) |
| Deploy | PM2 + Nginx |
| IA Geracao | Claude API (Anthropic SDK) |
| Busca Noticias | Tavily API (primario) + RSS (fallback) |

---

## Status do Projeto

### Fase 1: Infraestrutura Base - CONCLUIDA

| Tarefa | Status |
|--------|--------|
| Configurar IP exclusivo (187.45.185.92) | Concluido |
| Configurar Nginx reverse proxy | Concluido |
| Configurar SSL (Let's Encrypt) | Concluido |
| Configurar DNS blog.tribhus.com.br | Concluido |

### Fase 2: Estrutura Next.js - CONCLUIDA

| Tarefa | Status |
|--------|--------|
| Criar projeto Next.js 14 | Concluido |
| Configurar Tailwind CSS | Concluido |
| Criar layout base (header, footer) | Concluido |
| Criar pagina inicial | Concluido |
| Criar pagina de listagem por categoria | Concluido |
| Criar pagina de artigo individual | Concluido |
| Criar pagina de busca | Concluido |
| Implementar SEO completo | Concluido |
| Aplicar identidade visual Tribhus | Concluido |

### Fase 3: Backend e Banco de Dados - CONCLUIDA

| Tarefa | Status |
|--------|--------|
| Criar estrutura backend Express | Concluido |
| Configurar Prisma ORM | Concluido |
| Criar API de posts (CRUD) | Concluido |
| Criar API de categorias | Concluido |
| Criar API de autores | Concluido |
| Criar API de busca | Concluido |
| Implementar paginacao | Concluido |
| Criar tabelas no PostgreSQL | Concluido |
| Conectar frontend com API | Concluido |
| Testar fluxo completo | Concluido |

### Fase 2.5: Identidade Visual e Branding - CONCLUIDA

| Tarefa | Status |
|--------|--------|
| Integrar logo oficial Tribhus | Concluido |
| Copiar favicons do tribhus_web | Concluido |
| Criar LinkBar com links sociais | Concluido |
| Redesign UI mais organico (menos "quadrado") | Concluido |
| Ajustar tamanho e posicionamento da logo | Concluido |

### Fase 4: Painel Administrativo - CONCLUIDA

| Tarefa | Status |
|--------|--------|
| Criar tela de login admin | Concluido |
| Criar dashboard com estatisticas | Concluido |
| Criar editor de posts (TipTap Rich Text) | Concluido |
| Criar gerenciamento de categorias | Concluido |
| Criar gerenciamento de autores | Concluido |
| Criar upload de imagens (MinIO/S3) | Concluido |
| Sistema de rascunhos | Concluido |
| Inserir videos YouTube/Vimeo | Concluido |
| Painel de SEO com preview Google | Concluido |
| Manual do usuario | Concluido |

### Fase 5: Servico de IA - CONCLUIDA

| Tarefa | Status |
|--------|--------|
| Integrar Claude API (Anthropic SDK) | Concluido |
| Criar servico de geracao de artigos | Concluido |
| Criar prompts especializados por categoria | Concluido |
| Implementar calendario editorial | Concluido |
| Implementar busca de noticias (RSS) | Concluido |
| Adicionar fontes internacionais (EUA, Europa) | Concluido |
| Configurar cron jobs (scheduler) | Concluido |
| Criar controles liga/desliga scheduler | Concluido |
| Criar interface admin para IA | Concluido |
| Implementar webhook para nova banda | Concluido |
| Traducao automatica EN->PT | Concluido |
| Integrar Tavily API (busca enriquecida) | Concluido |
| Implementar regras anti-alucinacao | Concluido |
| Adicionar busca global (mundo todo) | Concluido |
| Sistema de alertas (fallback RSS) | Concluido |
| Progress bar e toast notifications | Concluido |

### Fase 6: Integracao com Tribhus - PARCIAL

| Tarefa | Status |
|--------|--------|
| Webhook para nova banda cadastrada | Concluido |
| Integracao com dados do backend Tribhus | Pendente |
| Notificacoes para admin | Pendente |

---

## Arquitetura

```
tribhus_blog/
├── frontend/                   # Next.js 14 Frontend (porta 3000)
│   ├── src/
│   │   ├── app/                # App Router (Next.js 14)
│   │   │   ├── layout.tsx      # Layout principal
│   │   │   ├── page.tsx        # Pagina inicial
│   │   │   ├── globals.css     # Estilos globais
│   │   │   ├── [slug]/         # Artigo individual
│   │   │   ├── categoria/      # Listagem por categoria
│   │   │   ├── busca/          # Pagina de busca
│   │   │   └── admin/          # PAINEL ADMINISTRATIVO
│   │   │       ├── layout.tsx      # Layout do admin (com auth)
│   │   │       ├── page.tsx        # Dashboard
│   │   │       ├── login/          # Tela de login
│   │   │       ├── posts/          # Gerenciamento de posts
│   │   │       │   ├── page.tsx        # Lista de posts
│   │   │       │   ├── new/            # Novo post
│   │   │       │   └── [id]/edit/      # Editar post
│   │   │       ├── categories/     # Gerenciamento de categorias
│   │   │       ├── authors/        # Gerenciamento de autores
│   │   │       ├── manual/         # Manual do usuario
│   │   │       └── ai/             # CONTROLE DE IA
│   │   │           └── page.tsx        # Calendario editorial, scheduler, geracao
│   │   ├── components/         # Componentes React
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx      # Header com logo grande
│   │   │   │   ├── Footer.tsx      # Footer com logo e links
│   │   │   │   ├── LinkBar.tsx     # Barra de links sociais
│   │   │   │   └── LayoutWrapper.tsx # Wrapper que oculta header/footer no admin
│   │   │   ├── posts/
│   │   │   │   ├── PostCard.tsx
│   │   │   │   └── FeaturedPost.tsx
│   │   │   └── admin/          # COMPONENTES DO ADMIN
│   │   │       ├── layout/
│   │   │       │   ├── AdminSidebar.tsx    # Menu lateral
│   │   │       │   └── AdminHeader.tsx     # Header do admin
│   │   │       ├── editor/
│   │   │       │   ├── RichTextEditor.tsx  # Editor TipTap
│   │   │       │   ├── EditorToolbar.tsx   # Barra de ferramentas
│   │   │       │   ├── ImageUpload.tsx     # Modal upload imagens
│   │   │       │   └── VideoEmbed.tsx      # Modal embed videos
│   │   │       ├── seo/
│   │   │       │   ├── SEOPanel.tsx        # Painel de SEO
│   │   │       │   └── GooglePreview.tsx   # Preview do Google
│   │   │       ├── posts/
│   │   │       │   ├── PostForm.tsx        # Formulario de posts
│   │   │       │   └── PostsTable.tsx      # Tabela de posts
│   │   │       └── dashboard/
│   │   │           └── StatsCard.tsx       # Card de estatisticas
│   │   │   └── ui/
│   │   │       └── Toast.tsx           # Toast notifications + useToast hook
│   │   ├── contexts/
│   │   │   └── AdminAuthContext.tsx  # Contexto de autenticacao
│   │   ├── services/
│   │   │   ├── api.ts          # API client publico
│   │   │   └── adminApi.ts     # API client admin (com JWT)
│   │   └── types/              # TypeScript types
│   ├── public/                 # Arquivos estaticos
│   │   └── images/
│   └── tailwind.config.ts      # Configuracao Tailwind
├── backend/                    # Express.js Backend (porta 3001)
│   ├── src/
│   │   ├── controllers/        # Controllers
│   │   │   ├── postsController.ts    # Controller de posts
│   │   │   └── aiController.ts       # Controller de IA
│   │   ├── routes/
│   │   │   ├── posts.ts        # Rotas publicas de posts
│   │   │   ├── categories.ts   # Rotas de categorias
│   │   │   ├── authors.ts      # Rotas de autores
│   │   │   ├── auth.ts         # Autenticacao (login)
│   │   │   ├── admin.ts        # Rotas admin (CRUD completo)
│   │   │   ├── upload.ts       # Upload de imagens
│   │   │   └── ai.ts           # Rotas de IA (geracao, scheduler, webhook)
│   │   ├── middlewares/
│   │   │   └── auth.ts         # Middleware JWT
│   │   ├── services/
│   │   │   ├── minio.ts        # Servico de upload MinIO/S3
│   │   │   ├── ai/             # SERVICOS DE IA
│   │   │   │   ├── claude.ts       # Integracao Claude API (Anthropic SDK)
│   │   │   │   ├── prompts.ts      # Templates de prompts + regras anti-alucinacao
│   │   │   │   └── articleGenerator.ts  # Logica de geracao e salvamento
│   │   │   ├── news/           # SERVICOS DE NOTICIAS
│   │   │   │   ├── tavilyService.ts    # Busca enriquecida Tavily (PRIMARIO)
│   │   │   │   ├── rssService.ts   # Busca de feeds RSS (fallback)
│   │   │   │   ├── newsApiService.ts   # Integracao NewsAPI (opcional)
│   │   │   │   └── newsAggregator.ts   # Agregador (Tavily + RSS)
│   │   │   └── cron/           # JOBS AGENDADOS
│   │   │       └── scheduler.ts    # Scheduler com calendario editorial
│   │   ├── types/
│   │   │   └── ai.ts           # Tipos e config do calendario editorial
│   │   └── server.ts           # Entry point
│   ├── prisma/                 # Schema Prisma
│   └── Dockerfile              # Imagem Docker (node:20-slim)
├── docker-compose.yml          # Orquestracao
├── .env                        # Variaveis de ambiente
└── PROJETOBLOG.md              # Este documento
```

---

## Painel Administrativo

### Acesso

**URL:** https://blog.tribhus.com.br/admin/login
**Usuario inicial:** admin@tribhus.com.br
**Senha inicial:** Tribhus@2024

### Paginas do Admin

| Pagina | Rota | Funcao |
|--------|------|--------|
| Login | /admin/login | Autenticacao de administradores |
| Dashboard | /admin | Estatisticas e acoes rapidas |
| Posts | /admin/posts | Lista de posts com filtros |
| Novo Post | /admin/posts/new | Criar novo post |
| Editar Post | /admin/posts/[id]/edit | Editar post existente |
| Categorias | /admin/categories | CRUD de categorias |
| Autores | /admin/authors | CRUD de autores |
| Manual | /admin/manual | Guia de uso do painel |
| IA | /admin/ai | Controle de geracao automatica de artigos |

### Editor de Posts (TipTap)

O editor rich text suporta:
- **Formatacao:** Negrito, italico, sublinhado
- **Titulos:** H1, H2, H3
- **Listas:** Ordenadas e nao ordenadas
- **Citacoes:** Blocos de citacao
- **Codigo:** Blocos de codigo
- **Links:** Inserir links em texto
- **Imagens:** Upload ou URL (armazenadas no MinIO)
- **Videos:** Embed de YouTube e Vimeo

### Painel de SEO

- Titulo SEO (max 60 caracteres)
- Descricao SEO (max 160 caracteres)
- Palavra-chave foco
- Preview do Google em tempo real

### Upload de Imagens

- Storage: MinIO/S3 (187.45.185.92:9000)
- Bucket: blog-images
- Formatos: JPG, PNG, GIF, WebP
- Tamanho maximo: 10MB
- URL publica: https://187.45.185.92:9000/blog-images/

### Autenticacao

- JWT Token (expira em 7 dias)
- Middleware de autenticacao em todas as rotas admin
- Middleware de verificacao de admin (isAdmin: true)
- Cookie httpOnly para armazenar token

---

## Servico de IA (Fase 5)

### Visao Geral

Sistema de geracao automatica de artigos usando Claude AI (Anthropic), com:
- Calendario editorial (categoria diferente por dia da semana)
- **Busca enriquecida via Tavily API** (primario) com cobertura global
- Fallback para RSS caso Tavily nao esteja configurado
- **Regras anti-alucinacao** rigorosas nos prompts
- Traducao automatica de ingles para portugues
- Artigos salvos como RASCUNHO para aprovacao do admin
- Controle total via interface admin (ligar/desligar scheduler)
- Sistema de alertas quando usando modo RSS (fallback)
- Progress bar com feedback detalhado durante geracao
- Toast notifications quando artigos estao prontos

### Acesso

**URL:** https://blog.tribhus.com.br/admin/ai

### Calendario Editorial

| Dia | Categoria | Foco |
|-----|-----------|------|
| Segunda | Noticias | Noticias gerais do mundo do rock/metal |
| Terca | Lancamentos | Novos albuns, singles, EPs, clipes |
| Quarta | Novidades | Novidades, projetos, retornos, colaboracoes |
| Quinta | Tecnologia | Gear, equipamentos, pedais, amplificadores |
| Sexta | Eventos | Shows, festivais, turnes (prepara pro fim de semana) |
| Sabado | Curiosidades | Historias, fatos raros, bastidores |
| Domingo | Reviews | Criticas de albuns e shows |

### Fontes de Noticias (RSS)

#### Brasil
- Whiplash (https://whiplash.net/rss/whiplash.xml)
- Roadie Crew (https://roadiecrew.com/feed/)
- Rock Brazuca (https://rockbrazuca.uol.com.br/feed/)
- Tenho Mais Discos Que Amigos (https://www.tenhomaisdiscosqueamigos.com/feed/)

#### EUA
- Blabbermouth (https://www.blabbermouth.net/feed/)
- Loudwire (https://loudwire.com/feed/)
- Metal Injection (https://metalinjection.net/feed)
- Ultimate Guitar (https://www.ultimate-guitar.com/news/rss.xml)
- Revolver Magazine (https://www.revolvermag.com/feed)

#### Europa
- Metal Hammer UK (https://www.loudersound.com/feeds/metal-hammer)
- Kerrang (https://www.kerrang.com/feed)
- Bravewords (https://bravewords.com/feed)
- Metal Storm (https://www.metalstorm.net/pub/rss.php)
- Consequence Heavy (https://consequence.net/category/heavy/feed/)

### Busca Enriquecida via Tavily (PRIMARIO)

O sistema usa a Tavily API como fonte primaria de busca de noticias, oferecendo:

#### Vantagens sobre RSS
- **Cobertura global**: Busca em sites do mundo todo (EUA, Europa, Asia, Africa, Oceania, Brasil)
- **Multiplas fontes por artigo**: Cada noticia e enriquecida com 3-5 fontes adicionais
- **Anti-alucinacao**: Fontes verificaveis para cada informacao
- **Conteudo atualizado**: Busca em tempo real, nao depende de feeds RSS

#### Fluxo de Busca Tavily (30 buscas/dia)
```
Fase 1 - Descoberta (12 buscas):
    -> Executa 3 queries da categoria em 4 regioes
    -> Coleta noticias recentes
    -> Seleciona as 3 melhores por relevancia

Fase 2 - Enriquecimento (18 buscas = 6 por artigo x 3):
    -> Para cada noticia selecionada:
        -> Busca fontes adicionais sobre o tema
        -> Busca contexto e background
        -> Busca citacoes e entrevistas relacionadas
    -> Compila todas as fontes para o prompt
```

#### Queries por Categoria (exemplos)

Cada categoria tem 10+ queries em ingles e portugues para cobertura global:

| Categoria | Exemplos de Queries |
|-----------|---------------------|
| Noticias | "rock band news 2026", "metal music news", "noticias rock brasil" |
| Lancamentos | "new rock album release 2026", "novo album metal brasileiro" |
| Tecnologia | "guitar amp review 2026", "best distortion pedal", "pedaleira guitarra" |
| Eventos | "rock festival 2026", "metal concert tour", "shows rock brasil" |
| Curiosidades | "rock band history facts", "metal bands trivia" |
| Reviews | "rock album review 2026", "critica album rock" |

#### Fallback para RSS

Se a TAVILY_API_KEY nao estiver configurada:
- Sistema usa automaticamente as fontes RSS listadas acima
- **Alerta e exibido** no painel admin avisando do modo degradado
- Recomendado configurar Tavily para melhor qualidade

### Regras Anti-Alucinacao

Para evitar que o Claude invente informacoes, os prompts incluem regras rigorosas:

```
REGRAS CRITICAS - ANTI-ALUCINACAO:
1. Use APENAS informacoes das fontes fornecidas
2. NAO invente citacoes, numeros ou fatos
3. Se uma informacao nao esta nas fontes, NAO a inclua
4. Prefira dizer "nao ha informacoes sobre X" a inventar
5. Cite a fonte ao mencionar fatos especificos
6. NAO assuma equipamentos usados em gravacoes especificas
7. NAO use seu conhecimento previo - apenas as fontes
```

**Regra especial para Tecnologia:**
Se uma banda gravou uma musica nova e nao mencionou qual equipamento usou, o Claude NAO pode assumir que foi o equipamento que a banda costuma usar. Deve dizer que "nao foi divulgado" ou similar.

### Endpoints da API de IA

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| POST | /api/ai/webhook/new-band | Webhook Secret | Webhook para nova banda (dispara artigo de boas-vindas) |
| POST | /api/ai/generate/news | Admin JWT | Gerar artigos manualmente (categoria opcional) |
| POST | /api/ai/generate/welcome/:bandId | Admin JWT | Gerar artigo de boas-vindas para banda |
| GET | /api/ai/jobs/status | Admin JWT | Status dos jobs de geracao |
| GET | /api/ai/news/preview | Admin JWT | Preview das noticias agregadas |
| POST | /api/ai/scheduler/start | Admin JWT | Ligar scheduler automatico |
| POST | /api/ai/scheduler/stop | Admin JWT | Desligar scheduler automatico |
| GET | /api/ai/scheduler/status | Admin JWT | Status detalhado do scheduler |

### Interface Admin (/admin/ai)

A pagina de IA no admin possui:

1. **Calendario Editorial** - Visualizacao dos 7 dias com destaque no dia atual
2. **Status do Sistema** - Mostra modo de busca (Tavily/RSS) e alertas
3. **Scheduler Automatico** - Liga/desliga a geracao automatica (06:00 diariamente)
4. **Geracao Manual** - Botao para gerar artigos na hora, com seletor de categoria
5. **Preview de Noticias** - Lista as noticias disponiveis para geracao
6. **Fontes de Noticias** - Informacoes sobre as fontes Brasil/Internacional
7. **Progress Bar** - Feedback detalhado durante geracao (12 etapas com Tavily)
8. **Toast Notifications** - Aviso quando artigos estao prontos com botao "Ver Rascunhos"
9. **Sistema de Alertas** - Avisos importantes (ex: usando RSS ao inves de Tavily)

#### Etapas de Progresso (Modo Tavily)

Durante a geracao, o admin ve as seguintes etapas:
1. Verificando configuracoes do sistema...
2. Identificando categoria do dia...
3. Buscando noticias relevantes (Tavily Discovery)...
4. Analisando e ranqueando noticias encontradas...
5. Selecionando as 3 melhores noticias...
6. Enriquecendo noticia 1/3 com fontes adicionais...
7. Enriquecendo noticia 2/3 com fontes adicionais...
8. Enriquecendo noticia 3/3 com fontes adicionais...
9. Gerando artigo 1/3 com Claude AI...
10. Gerando artigo 2/3 com Claude AI...
11. Gerando artigo 3/3 com Claude AI...
12. Finalizando e salvando artigos...

### Fluxo de Geracao

#### Com Tavily (Recomendado)

```
1. Scheduler dispara (06:00) ou admin clica "Gerar Agora"
2. Sistema verifica qual categoria e do dia (calendario editorial)
3. FASE DESCOBERTA - 12 buscas Tavily:
   a. Seleciona 3 queries da categoria
   b. Busca em 4 regioes (Americas, Europa, Asia, Global)
   c. Coleta noticias recentes e relevantes
   d. Ordena por relevancia e data
   e. Seleciona as 3 melhores noticias
4. FASE ENRIQUECIMENTO - 18 buscas (6 por noticia):
   a. Busca fontes adicionais sobre o tema
   b. Busca contexto historico/background
   c. Busca citacoes e entrevistas
   d. Busca detalhes tecnicos (se aplicavel)
   e. Busca repercussao/reacoes
   f. Busca videos relacionados (YouTube)
5. Para cada noticia enriquecida:
   a. Compila todas as fontes em formato estruturado
   b. Envia para Claude API com prompt anti-alucinacao
   c. Claude gera artigo APENAS com informacoes das fontes
   d. Retorna JSON com: title, excerpt, content, tags, SEO
   e. Salva como RASCUNHO na categoria correta
6. Admin revisa em Posts > Rascunhos
7. Admin adiciona imagem de capa (manual)
8. Admin publica
```

#### Com RSS (Fallback)

```
1. Scheduler dispara (06:00) ou admin clica "Gerar Agora"
2. Sistema verifica qual categoria e do dia (calendario editorial)
3. Busca noticias de todas as fontes RSS
4. Filtra noticias recentes (ultimas 72h)
5. Filtra por keywords da categoria
6. Calcula score de relevancia
7. Seleciona as 3 melhores noticias
8. Para cada noticia:
   a. Envia para Claude API com prompt da categoria
   b. Claude reescreve em portugues (traduz se necessario)
   c. Retorna JSON com: title, excerpt, content, tags, SEO
   d. Salva como RASCUNHO na categoria correta
9. Admin revisa em Posts > Rascunhos
10. Admin adiciona imagem de capa (manual)
11. Admin publica

⚠️ ALERTA: Modo RSS tem menos fontes e maior risco de alucinacao
```

### Arquivos do Servico de IA

#### backend/src/types/ai.ts
- Interfaces: GeneratedArticle, BandData, NewsItem, CategoryConfig, EnrichedNewsItem, etc
- Configuracao de feeds RSS (RSS_FEEDS)
- Configuracao de categorias (CATEGORY_CONFIGS) com keywords
- **TAVILY_CATEGORY_QUERIES** - 70+ queries por categoria para busca global
- Calendario editorial (EDITORIAL_CALENDAR)
- Helpers: getTodayCategory(), getCategoryForDay()

#### backend/src/services/ai/claude.ts
- Cliente Anthropic SDK
- isClaudeConfigured() - verifica se API key esta configurada
- generateArticle() - chamada generica ao Claude
- generateWelcomeArticle() - artigo de boas-vindas para banda
- generateNewsArticle() - artigo de noticia com categoria
- **generateArticleFromEnrichedSources()** - artigo com fontes Tavily (anti-alucinacao)

#### backend/src/services/ai/prompts.ts
- **ANTI_HALLUCINATION_RULES** - constante com regras rigorosas anti-alucinacao
- welcomeSystemPrompt() - instrucoes para artigos de boas-vindas
- welcomePrompt(band) - dados da banda formatados
- newsSystemPrompt(category) - instrucoes para artigos de noticias
- newsPrompt(news, category) - dados da noticia formatados
- **getSystemPromptForCategory()** - prompt com regras especificas por categoria
- **generateUserPrompt()** - gera prompt do usuario com fontes formatadas

#### backend/src/services/ai/articleGenerator.ts
- getAiAuthor() - busca/cria autor "Tribhus IA" (isAi: true)
- saveGeneratedArticle() - salva artigo no banco como RASCUNHO
- generateAndSaveWelcomeArticle() - fluxo completo para banda
- generateAndSaveNewsArticle() - fluxo completo para noticia (RSS)
- **generateAndSaveEnrichedArticle()** - fluxo completo com Tavily (anti-alucinacao)
- **generateMultipleEnrichedArticles()** - gera multiplos artigos enriquecidos
- getBandDataById() - busca dados de banda do banco Tribhus

#### backend/src/services/news/rssService.ts
- fetchFeed() - busca um feed RSS especifico
- fetchAllRSSFeeds() - busca todos os feeds ativos
- filterRecentNews() - filtra por data (ultimas X horas)
- filterRelevantNews() - filtra por keywords gerais
- filterNewsByCategory() - filtra por keywords da categoria
- calculateCategoryScore() - calcula relevancia para categoria

#### backend/src/services/news/tavilyService.ts (NOVO)
- isTavilyConfigured() - verifica se API key esta configurada
- searchTavily() - busca generica na Tavily API
- discoverNewsForCategory() - fase de descoberta (12 buscas)
- enrichNewsItem() - enriquece uma noticia com fontes adicionais
- fetchAndEnrichNews() - fluxo completo descoberta + enriquecimento
- formatSourcesForPrompt() - formata fontes para o prompt do Claude

#### backend/src/services/news/newsAggregator.ts
- aggregateNews() - agrega todas as fontes
- getTopNewsForArticles() - busca melhores noticias gerais
- getNewsForCategory() - busca noticias para categoria especifica
- getNewsForToday() - busca noticias para categoria do dia
- **getEnrichedNewsForToday()** - busca com Tavily para categoria do dia
- **getEnrichedNewsForCategory()** - busca com Tavily para categoria especifica

#### backend/src/services/cron/scheduler.ts
- initializeScheduler() - inicia job agendado (06:00)
- startScheduler() - liga scheduler manualmente
- stopScheduler() - desliga scheduler
- runNewsJobManually() - executa job na hora
- getSchedulerStatus() - retorna status detalhado (inclui tavilyConfigured, searchMode, alerts)
- getJobsStatus() - retorna status dos jobs
- **addAlert()** - adiciona alerta para o admin
- **getPendingAlerts()** - retorna alertas pendentes
- **clearAlerts()** - limpa alertas

### Configuracao

#### Variaveis de Ambiente (.env)
```bash
# Claude API (OBRIGATORIO para IA funcionar)
CLAUDE_API_KEY=sk-ant-api03-...

# Tavily API (RECOMENDADO - busca enriquecida com anti-alucinacao)
TAVILY_API_KEY=tvly-...

# NewsAPI (opcional - fonte adicional de noticias)
NEWSAPI_KEY=

# Webhook Secret (para integracao com Tribhus principal)
WEBHOOK_SECRET=tribhus-webhook-secret-2025
```

#### Obtendo a API Key da Tavily (Recomendado)
1. Acesse https://tavily.com/
2. Crie conta ou faca login
3. Va em "API Keys"
4. Copie a chave (tvly-...)
5. Cole no arquivo .env como TAVILY_API_KEY
6. **Free tier:** 1000 buscas/mes (suficiente para ~30/dia)

#### Obtendo a API Key do Claude
1. Acesse https://console.anthropic.com/
2. Crie conta ou faca login
3. Va em "API Keys"
4. Clique "Create Key"
5. Copie a chave (sk-ant-api03-...)
6. Cole no arquivo .env

### Dependencias Instaladas

```bash
npm install @anthropic-ai/sdk rss-parser
```

- **@anthropic-ai/sdk** - SDK oficial da Anthropic para Claude API
- **rss-parser** - Parser de feeds RSS (usado no fallback)

**Nota:** Tavily usa fetch nativo, nao requer dependencia adicional

### Autor IA

O sistema cria automaticamente um autor especial:
- **Nome:** Tribhus IA
- **Slug:** tribhus-ia
- **Email:** ia@tribhus.com.br
- **isAi:** true

Todos os artigos gerados pela IA sao atribuidos a este autor.

### Troubleshooting

#### Claude API Key nao funciona
1. Verifique se a chave esta no .env
2. Verifique se o docker-compose usa env_file
3. Recrie o container: `docker compose up -d --force-recreate backend`

#### Sistema usando RSS ao inves de Tavily
1. Verifique se TAVILY_API_KEY esta no .env raiz (nao no backend/.env)
2. Recrie o container: `docker compose up -d --force-recreate backend`
3. Verifique no painel /admin/ai se mostra "Modo: Tavily"
4. Se aparecer alerta amarelo, a key nao esta configurada

#### Nenhuma noticia encontrada para categoria
**Com Tavily:**
1. Verifique se a API key esta ativa em tavily.com
2. Verifique logs para erros de busca
3. Tente outra categoria

**Com RSS (fallback):**
1. Verifique se os feeds RSS estao funcionando
2. Aumente o periodo de busca (72h para 96h) em newsAggregator.ts
3. Adicione mais keywords na categoria em types/ai.ts

#### Artigos nao aparecem em Rascunhos
1. Verifique logs: `docker compose logs backend`
2. Verifique se a categoria existe no banco
3. Verifique se o autor IA foi criado

#### Claude ainda inventando informacoes
1. Verifique se esta usando Tavily (fontes mais ricas)
2. Verifique se prompts.ts tem as regras anti-alucinacao
3. Atualize o backend: `docker compose build backend --no-cache && docker compose up -d backend`

#### Geracao muito lenta
1. E normal: cada artigo leva 30-60 segundos com Claude
2. Com 3 artigos, total pode ser 2-3 minutos
3. Nao feche a pagina durante geracao
4. Acompanhe o progresso na barra de status

---

## Componentes de Layout

### Header.tsx

Cabecalho principal do blog com:
- Logo Tribhus grande (h-36) + texto "Blog" alinhado na base
- Navegacao desktop: Inicio, Noticias, Lancamentos, Entrevistas
- Botao de busca expansivel
- Link para tribhus.com.br
- Menu mobile hamburguer
- Efeito blur no fundo (backdrop-blur-lg)
- Altura: h-32

### LinkBar.tsx

Barra horizontal abaixo do header com links da Tribhus:
- Fundo laranja (bg-primary)
- Links em ordem: App Store, Play Store, Site, Instagram, YouTube, Facebook, WhatsApp
- Icones + texto (texto oculto em mobile)
- Botoes com estilo pill (rounded-full)

### Footer.tsx

Rodape com:
- Logo Tribhus (h-16) + texto "Blog"
- Links de categorias
- Links Tribhus (Plataforma, Bandas, Sobre)
- Redes sociais (Instagram, Twitter, YouTube)
- Copyright e links de Privacidade/Termos

---

## Categorias do Blog

| Categoria | Slug | Descricao |
|-----------|------|-----------|
| Noticias | noticias | Noticias do mundo do rock underground |
| Lancamentos | lancamentos | Novos albuns, singles e EPs |
| Tecnologia | tecnologia | Tech para musicos e bandas |
| Novidades | novidades | Novidades da plataforma Tribhus |
| Curiosidades | curiosidades | Fatos e historias do rock |
| Entrevistas | entrevistas | Conversas com artistas |
| Eventos | eventos | Shows, festivais e encontros |
| Reviews | reviews | Criticas de albuns e shows |

---

## Modelo de Dados (PostgreSQL)

### Tabela: blog_posts

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| title | VARCHAR(255) | Titulo do post |
| slug | VARCHAR(255) | URL amigavel |
| excerpt | TEXT | Resumo do post |
| content | TEXT | Conteudo completo (Markdown) |
| cover_image | VARCHAR(500) | URL da imagem de capa |
| category_id | UUID | FK para categoria |
| author_id | UUID | FK para autor |
| status | ENUM | draft, published, scheduled |
| featured | BOOLEAN | Post em destaque |
| published_at | TIMESTAMP | Data de publicacao |
| created_at | TIMESTAMP | Data de criacao |
| updated_at | TIMESTAMP | Data de atualizacao |
| meta_title | VARCHAR(60) | Titulo SEO |
| meta_description | VARCHAR(160) | Descricao SEO |
| views | INTEGER | Contador de visualizacoes |

### Tabela: blog_categories

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| name | VARCHAR(100) | Nome da categoria |
| slug | VARCHAR(100) | URL amigavel |
| description | TEXT | Descricao da categoria |
| color | VARCHAR(7) | Cor hex da categoria |
| created_at | TIMESTAMP | Data de criacao |

### Tabela: blog_authors

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| name | VARCHAR(100) | Nome do autor |
| slug | VARCHAR(100) | URL amigavel |
| bio | TEXT | Biografia |
| avatar | VARCHAR(500) | URL do avatar |
| email | VARCHAR(255) | Email (unico, usado para login) |
| password | VARCHAR(255) | Senha hash (bcrypt) |
| is_ai | BOOLEAN | Se e autor IA |
| is_admin | BOOLEAN | Se tem acesso ao painel admin |
| created_at | TIMESTAMP | Data de criacao |

### Tabela: blog_tags

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico |
| name | VARCHAR(50) | Nome da tag |
| slug | VARCHAR(50) | URL amigavel |

### Tabela: blog_post_tags

| Campo | Tipo | Descricao |
|-------|------|-----------|
| post_id | UUID | FK para post |
| tag_id | UUID | FK para tag |

---

## SEO Implementado

### Meta Tags por Pagina

- Title tag otimizado (max 60 chars)
- Meta description (max 160 chars)
- Canonical URL
- Robots meta tag
- Open Graph (Facebook, LinkedIn)
- Twitter Cards
- JSON-LD Schema (Article, Organization, BreadcrumbList, WebSite com SearchAction)

### Recursos SEO

- Sitemap.xml dinamico
- Robots.txt configurado
- URLs amigaveis (slugs)
- Heading hierarchy (H1, H2, H3)
- Alt text em imagens
- Links internos
- Core Web Vitals otimizados
- Mobile-first design

---

## Identidade Visual

### Cores (baseado em tribhus_web)

| Variavel | Cor | Hex |
|----------|-----|-----|
| primary | Laranja/Marrom | #914100 |
| primary-hover | Laranja | #e55a00 |
| primary-light | Laranja claro | #FF8C00 |
| bg-dark | Fundo principal | #151922 |
| bg-card | Fundo de cards | #1E2233 |
| bg-input | Fundo de inputs | #0f1419 |
| border | Bordas | #333333 |
| text | Texto principal | #FFFFFF |
| text-secondary | Texto secundario | #CCCCCC |
| text-muted | Texto muted | #888888 |

### Tipografia

- Headings: Inter / System UI
- Body: Inter / System UI
- Code: Monospace

### Design

- Dark theme (rock/underground)
- Visual organico e fluido (bordas arredondadas rounded-2xl, rounded-3xl)
- Sem emojis
- Cards com bordas sutis e gradientes
- Hover effects com cor primaria
- Espacamento generoso
- Efeitos de blur no header

### Assets

Arquivos copiados de tribhus_web para frontend/public/images/:
- logo_horizontal.png - Logo com texto "Tribhus"
- logotipo.png - Simbolo/icone Tribhus
- favicon.ico - Favicon do site
- apple-touch-icon.png - Icone para iOS
- favicon-16x16.png, favicon-32x32.png - Favicons em varios tamanhos

---

## Variaveis de Ambiente (.env)

### Raiz do Projeto (.env)
```bash
# Database
DATABASE_URL=postgresql://postgres:%40tribhusdb87@187.45.185.91:5432/tribhus_db

# JWT
JWT_SECRET=tribhus-blog-jwt-secret-2025-secure

# URLs
FRONTEND_URL=https://blog.tribhus.com.br
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=https://blog.tribhus.com.br

# Claude API (OBRIGATORIO para geracao de artigos com IA)
CLAUDE_API_KEY=sk-ant-api03-...

# Tavily API (RECOMENDADO - busca enriquecida com multiplas fontes)
TAVILY_API_KEY=tvly-...

# NewsAPI (opcional - fonte adicional de noticias)
NEWSAPI_KEY=

# Webhook Secret (para integracao com Tribhus principal)
WEBHOOK_SECRET=tribhus-webhook-secret-2025

# Storage
STORAGE_PATH=/opt/tribhus_blog/uploads

# MinIO/S3
MINIO_ACCESS_KEY=TribeUser2024
MINIO_SECRET_KEY=S3cur3P@ssw0rd2000
```

### Frontend (via docker-compose)
```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://blog.tribhus.com.br
NEXT_PUBLIC_SITE_URL=https://blog.tribhus.com.br
```

### Backend (via docker-compose)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
FRONTEND_URL=https://blog.tribhus.com.br
MINIO_ENDPOINT=https://127.0.0.1:9000
MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
MINIO_BUCKET=blog-images
MINIO_PUBLIC_URL=https://187.45.185.92:9000
```

---

## Docker

### Configuracao

O projeto usa Docker Compose para orquestracao:

| Servico | Imagem | Porta | Rede |
|---------|--------|-------|------|
| frontend | tribhus_blog-frontend | 3000 | bridge |
| backend | tribhus_blog-backend | 3001 | host |

**Nota:** O backend usa `network_mode: host` para acessar o PostgreSQL que aceita apenas conexoes do IP do servidor (nao do IP interno do Docker).

### Dockerfile Backend

- Base: `node:20-slim` (Debian - compatibilidade com Prisma)
- Dependencias: openssl, ca-certificates
- Build: TypeScript compilado para dist/

### Dockerfile Frontend

- Base: `node:20-alpine` (mais leve)
- Build: Next.js standalone output
- Otimizado para producao

---

## Comandos

```bash
# === DOCKER (PRODUCAO) ===

# Build e iniciar todos os containers
cd /opt/tribhus_blog
docker compose build
docker compose up -d

# Rebuild apenas um servico
docker compose build frontend --no-cache
docker compose build backend --no-cache

# Reiniciar servicos
docker compose up -d --force-recreate frontend
docker compose up -d --force-recreate backend

# Ver logs
docker compose logs -f
docker compose logs --tail=50 backend

# Parar tudo
docker compose down

# === DESENVOLVIMENTO LOCAL ===

# Frontend
cd /opt/tribhus_blog/frontend
npm run dev

# Backend
cd /opt/tribhus_blog/backend
npm run dev

# === PRISMA ===

cd /opt/tribhus_blog/backend
npx prisma generate
npx prisma migrate dev
npx prisma studio

# === ADMIN ===

# Criar usuario admin
cd /opt/tribhus_blog/backend
npx ts-node create-admin.ts
```

---

## Nginx Config

Arquivo: /etc/nginx/sites-available/blog.tribhus.com.br

```nginx
server {
    listen 80;
    server_name blog.tribhus.com.br;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name blog.tribhus.com.br;

    ssl_certificate /etc/letsencrypt/live/blog.tribhus.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/blog.tribhus.com.br/privkey.pem;

    # Frontend Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Links Tribhus (LinkBar)

| Nome | URL |
|------|-----|
| App Store | https://apps.apple.com/us/app/tribhus/id6739949821 |
| Play Store | https://play.google.com/store/apps/details?id=com.tribhus |
| Site | https://tribhus.com.br |
| Instagram | https://instagram.com/tribhusbr |
| YouTube | https://www.youtube.com/@tribhus5311 |
| Facebook | https://facebook.com/tribhusbr |
| WhatsApp | https://wa.me/5519996647030 |

---

## Fluxos de Automacao (Fase 5) - IMPLEMENTADOS

### Fluxo 1: Nova Banda Cadastrada

```
Banda se cadastra no Tribhus
    -> Webhook POST /api/ai/webhook/new-band
    -> Header: x-webhook-secret ou Authorization: Bearer <secret>
    -> Body: { event: "band.created", data: { id, name, city, state, genres, ... } }
    -> Servico IA busca dados da banda
    -> Claude gera artigo de boas-vindas
    -> Salva como RASCUNHO na categoria "Bandas"
    -> Admin revisa e publica
```

**Endpoint:** POST /api/ai/webhook/new-band
**Autenticacao:** Header x-webhook-secret com valor de WEBHOOK_SECRET

### Fluxo 2: Geracao Automatica de Noticias (Scheduler)

```
Scheduler dispara (diariamente as 06:00 - America/Sao_Paulo)
    -> Verifica dia da semana
    -> Consulta calendario editorial para categoria do dia

    SE Tavily configurado (RECOMENDADO):
        -> FASE DESCOBERTA (12 buscas):
            -> Executa queries da categoria em multiplas regioes
            -> Coleta noticias recentes do mundo todo
        -> Seleciona top 3 noticias por relevancia
        -> FASE ENRIQUECIMENTO (18 buscas = 6 por noticia):
            -> Busca fontes adicionais
            -> Busca contexto e citacoes
            -> Busca videos relacionados
        -> Para cada noticia enriquecida:
            -> Compila todas as fontes
            -> Claude gera artigo APENAS com info das fontes (anti-alucinacao)
            -> Gera titulo, excerpt, content, tags, SEO

    SENAO (fallback RSS):
        -> Busca noticias de 15+ fontes RSS (Brasil + Internacional)
        -> Filtra por data (ultimas 72h)
        -> Filtra por keywords da categoria
        -> Calcula score de relevancia
        -> Seleciona top 3 noticias
        -> Claude reescreve em portugues
        -> ALERTA enviado ao admin sobre modo degradado

    -> Salva como RASCUNHO na categoria do dia
    -> Admin revisa, adiciona imagem e publica
```

**Controle:** Admin pode ligar/desligar via /admin/ai

### Fluxo 3: Geracao Manual de Noticias

```
Admin acessa /admin/ai
    -> Seleciona categoria (ou usa categoria do dia)
    -> Clica "Gerar Artigos Agora"
    -> Progress bar mostra etapas em tempo real:
        -> Descobrindo noticias (Tavily ou RSS)
        -> Enriquecendo com fontes adicionais (se Tavily)
        -> Gerando artigos com Claude AI
    -> Toast notification: "Artigos prontos!"
    -> Botao "Ver Rascunhos" no toast
    -> Artigos aparecem em Posts > Rascunhos
    -> Admin revisa e publica
```

**Util para:** Gerar artigos fora do horario do scheduler ou de categoria diferente

---

## Historico de Alteracoes

### 29/01/2026 - INTEGRACAO TAVILY E ANTI-ALUCINACAO
- **Tavily API integrada** como fonte primaria de busca de noticias
- Implementado fluxo de busca em duas fases:
  - Fase 1 (Descoberta): 12 buscas para encontrar noticias
  - Fase 2 (Enriquecimento): 18 buscas para enriquecer com fontes
- Adicionadas 70+ queries de busca por categoria
- **Cobertura global**: Queries em ingles e portugues para mundo todo
- **Regras anti-alucinacao** implementadas em todos os prompts:
  - Claude usa APENAS informacoes das fontes fornecidas
  - Proibido inventar citacoes, equipamentos, numeros
  - Regra especial para tecnologia (nao assumir equipamentos em gravacoes)
- Sistema de fallback automatico para RSS se Tavily nao configurado
- **Sistema de alertas** para avisar admin quando usando modo degradado
- **Progress bar detalhada** com 12 etapas durante geracao
- **Toast notifications** quando artigos estao prontos
- Botao "Ver Rascunhos" no toast para acesso rapido
- Nova variavel de ambiente: TAVILY_API_KEY
- Novo arquivo: backend/src/services/news/tavilyService.ts
- Atualizados: prompts.ts, claude.ts, articleGenerator.ts, newsAggregator.ts, scheduler.ts
- Frontend atualizado: admin/ai/page.tsx com progress e Toast.tsx

### 28/01/2026 - SERVICO DE IA COMPLETO (Fase 5)
- **Fase 5 concluida** - Servico de IA totalmente funcional
- Integrado Claude API (Anthropic SDK) para geracao de artigos
- Implementado calendario editorial com categoria por dia da semana:
  - Segunda: Noticias | Terca: Lancamentos | Quarta: Novidades
  - Quinta: Tecnologia | Sexta: Eventos | Sabado: Curiosidades | Domingo: Reviews
- Criados prompts especializados para cada categoria
- Implementado sistema de busca de noticias via RSS:
  - 4 fontes brasileiras (Whiplash, Roadie Crew, Rock Brazuca, Tenho Mais Discos)
  - 11 fontes internacionais (Blabbermouth, Loudwire, Metal Injection, Metal Hammer, Kerrang, etc)
- Implementada traducao automatica de ingles para portugues
- Criado scheduler automatico (diario as 06:00 - America/Sao_Paulo)
- Criado sistema de controle liga/desliga do scheduler
- Implementado webhook para nova banda cadastrada
- Criada interface completa em /admin/ai:
  - Visualizacao do calendario editorial
  - Botoes ligar/desligar scheduler
  - Geracao manual com selecao de categoria
  - Preview de noticias disponiveis
  - Informacoes sobre fontes
- Artigos gerados sao salvos como RASCUNHO para aprovacao
- Autor automatico: "Tribhus IA" (isAi: true)
- Imagens de capa devem ser adicionadas manualmente pelo admin
- Dependencias: @anthropic-ai/sdk, rss-parser

### 27/01/2026 - PAINEL ADMINISTRATIVO COMPLETO
- **Fase 4 concluida** - Painel Administrativo totalmente funcional
- Criada tela de login admin com autenticacao JWT
- Criado dashboard com estatisticas (posts, views, categorias, autores)
- Implementado editor rich text com TipTap:
  - Formatacao: negrito, italico, sublinhado
  - Titulos H1, H2, H3
  - Listas ordenadas e nao ordenadas
  - Citacoes e blocos de codigo
  - Links
- Implementado upload de imagens via MinIO/S3
- Implementado embed de videos YouTube e Vimeo
- Criado painel de SEO com preview do Google
- Criado sistema de gerenciamento de posts (lista, criar, editar, excluir)
- Criado sistema de gerenciamento de categorias
- Criado sistema de gerenciamento de autores
- Criado manual do usuario completo (/admin/manual)
- Criado LayoutWrapper para separar rotas admin (sem header/footer do blog)
- Configurado Docker:
  - Backend com network_mode: host (compatibilidade pg_hba.conf)
  - Backend migrado de Alpine para Debian slim (compatibilidade Prisma)
  - Configurado trust proxy para rate limiting
  - Adicionadas variaveis MinIO ao docker-compose
- Criado usuario admin inicial: admin@tribhus.com.br

### 26/01/2026
- Integrado logo oficial Tribhus (copiado de tribhus_web)
- Criado componente LinkBar com links sociais/apps
- Redesign UI para visual mais organico (menos quadrado)
- Ajustado tamanho da logo (h-36 no header, h-16 no footer)
- Texto "Blog" posicionado alinhado com base da logo
- Header com altura h-32 e efeito blur

### 25/01/2026
- Conectado dominio blog.tribhus.com.br via Nginx
- Backend Express rodando na porta 3001
- Frontend Next.js rodando na porta 3000

### 24/01/2026
- Projeto iniciado
- Estrutura base criada
- Fases 1-3 concluidas

---

*Documento criado em: 24/01/2025*
*Ultima atualizacao: 29/01/2026*
*Status: Fases 1-5 concluidas - Blog, Painel Admin e Servico de IA com Tavily totalmente funcionais*
