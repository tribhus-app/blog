'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { entrar } from './acoes';
import { Icone } from './icones';

/* =========================================================================
   ENTRAR NO PAINEL (/admin/login)

   As mesmas peças do ar, no mesmo lugar: a marca no alto, "Acesse o
   painel administrativo", Email, Senha e Entrar, com o erro numa caixa
   em cima dos campos. A marca é a assinatura do blog (palheta, TRIBHUS e
   "Blog") no lugar do quadrado com "T".

   Os quatro estados do ar:
   - parada;
   - entrando: o botão trava com o giro e "Entrando...";
   - erro: a caixa âmbar com a mensagem da API ("Acesso negado. Apenas
     administradores." para quem não é admin), e o quadro balança uma
     vez, como a senha errada no Mac (parado para quem pede menos
     movimento);
   - carregando: enquanto o layout confere a sessão (`/auth/me`), a
     palheta e "Carregando..." no meio da tela (`Carregando`, embaixo).

   CONTINUAR CONECTADO (pedido do Dione, 30/10), só no navegador, sem
   servidor: o ar já guarda o token por 7 dias para todo mundo.
   - a escolha é a chave do painel (a mesma do Destacar post), embaixo
     da senha, com a frase dizendo o que ela faz em cada estado;
   - ligada (o padrão, que é o comportamento de hoje): o cookie
     `admin_token` com `expires: 7`, e o e-mail guardado neste computador
     (localStorage `tribhus-blog-email`);
   - desligada: o cookie sem `expires` (acaba quando o navegador fecha),
     e o e-mail guardado é apagado.
   A CONTA LEMBRADA: com o e-mail guardado, o campo Email vira a conta,
   no mesmo lugar e na mesma altura (só leitura, com "Trocar" à direita),
   e o cursor já cai na senha, como no Google e na Apple. "Trocar" devolve
   o campo para escrever. O campo continua `autocomplete="username"`,
   então o gerenciador de senhas do navegador acha a conta igual.
   A senha o site não guarda. Quem guarda é o gerenciador do navegador:
   o Chrome, o Safari e o Edge oferecem salvar e preenchem sozinhos.
   ========================================================================= */

export function Carregando() {
  return (
    <div className="adm adm-entrar adm-carregando" role="status">
      <img src="/img/logo-simbolo.webp" alt="" width={160} height={144} />
      <span>Carregando...</span>
    </div>
  );
}

const CHAVE_DO_EMAIL = 'tribhus-blog-email';

/* Para onde ir depois de entrar: o ?redirect= do middleware (sem o /blog),
   só se for uma tela do painel. */
function destino() {
  const r = new URLSearchParams(location.search).get('redirect') ?? '';
  return /^\/admin(\/|$)/.test(r) && !/^\/admin\/(login|sair)/.test(r) ? r : '/admin';
}

export function Entrar() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ver, setVer] = useState(false);
  const [indo, setIndo] = useState(false);
  const [erro, setErro] = useState('');
  const [lembrar, setLembrar] = useState(true);
  const [lembrada, setLembrada] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const campoEmail = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CHAVE_DO_EMAIL);
      if (guardado) { setEmail(guardado); setLembrada(true); document.getElementById('adm-entrar-senha')?.focus(); }
    } catch { /* sem armazenamento (aba anônima): fica em branco */ }
  }, []);

  function trocar() {
    setLembrada(false);
    requestAnimationFrame(() => campoEmail.current?.select());
  }

  async function ir(e: FormEvent) {
    e.preventDefault();
    setIndo(true); setErro('');
    const r = await entrar(email, senha, lembrar);
    if (!r.ok) {
      setIndo(false); setErro(r.erro);
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        form.current?.animate(
          [0, -10, 8, -6, 4, -2, 0].map((x) => ({ transform: `translateX(${x}px)` })),
          { duration: 420, easing: 'cubic-bezier(.36,.07,.19,.97)' },
        );
      }
      document.getElementById('adm-entrar-senha')?.focus();
      return;
    }
    try {
      if (lembrar) localStorage.setItem(CHAVE_DO_EMAIL, email.trim());
      else localStorage.removeItem(CHAVE_DO_EMAIL);
    } catch { /* sem armazenamento: só não lembra */ }
    /* o cookie admin_token já foi gravado em entrar() (7 dias ou até fechar
       o navegador). A volta é com recarga inteira, para o layout do painel
       ler o cookie novo; ?redirect= é o caminho que o middleware guardou. */
    location.href = `/blog${destino()}`;
  }

  return (
    <div className="adm adm-entrar">
      <main className="adm-entrar-caixa">
        <div className="adm-entrar-marca" aria-label="Tribhus Blog">
          <img className="adm-palheta" src="/img/logo-simbolo.webp" alt="" width={160} height={144} />
          <img className="adm-wordmark" src="/img/logo-wordmark.webp" alt="Tribhus" width={420} height={156} />
          <span className="adm-marca-blog">Blog</span>
        </div>
        <form ref={form} className="adm-quadro adm-entrar-form" onSubmit={ir} noValidate>
          <h1>Acesse o painel administrativo</h1>
          {erro ? <p className="adm-entrar-erro" role="alert"><Icone nome="aviso" tamanho={18} />{erro}</p> : null}
          <div className="adm-campo">
            <label htmlFor="adm-entrar-email">Email</label>
            <div className="adm-email-conta" data-lembrada={lembrada ? '' : undefined}>
              <input ref={campoEmail} id="adm-entrar-email" className="adm-entrada" type="email" autoComplete="username" inputMode="email" placeholder="seu@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} readOnly={lembrada} aria-invalid={erro && !lembrada ? true : undefined} autoFocus={!lembrada} />
              {lembrada ? <button type="button" className="adm-email-trocar" onClick={trocar}>Trocar</button> : null}
            </div>
          </div>
          <div className="adm-campo">
            <label htmlFor="adm-entrar-senha">Senha</label>
            <div className="adm-senha">
              <input id="adm-entrar-senha" className="adm-entrada" type={ver ? 'text' : 'password'} autoComplete="current-password"
                value={senha} onChange={(e) => setSenha(e.target.value)} aria-invalid={erro ? true : undefined} />
              <button type="button" className="adm-bt-ic mini" onClick={() => setVer(!ver)} aria-label={ver ? 'Esconder a senha' : 'Mostrar a senha'} aria-pressed={ver}>
                <Icone nome={ver ? 'esconder' : 'ver'} tamanho={17} />
              </button>
            </div>
          </div>
          <label className="adm-chave adm-lembrar">
            <span>Continuar conectado<small>{lembrar ? 'Por 7 dias neste computador' : 'Até fechar o navegador'}</small></span>
            <input type="checkbox" role="switch" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
          </label>
          <button type="submit" className="adm-bt cheio largo" disabled={indo}>
            {indo ? <><span className="adm-giro" aria-hidden="true" />Entrando...</> : 'Entrar'}
          </button>
        </form>
        <a className="adm-link adm-entrar-volta" href="/blog"><Icone nome="voltar" tamanho={15} />Voltar ao blog</a>
      </main>
    </div>
  );
}
