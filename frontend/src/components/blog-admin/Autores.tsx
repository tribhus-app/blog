'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { excluirAutor, salvarAutor } from './acoes';
import { Avatar, CabecaDaTela, numero, slugar } from './comum';
import { Icone } from './icones';
import { Confirmar, Janela, avisar } from './pecas';
import { Solta } from './Solta';
import type { AutorDoPainel } from './tipos';

/* =========================================================================
   AUTORES (/admin/authors)

   Como no ar: "Novo Autor" no alto à direita e os cartões em três
   colunas, cada um com a foto, o nome, o selo (Admin ou IA), o e-mail, a
   bio, "N posts" e os botões Editar e Excluir. Novo e Editar abrem a
   mesma janela: Nome, Slug, Email, Senha ("deixe vazio para manter"),
   Bio, Avatar e as duas chaves, Administrador e Autor IA.

   O que mudou:
   - sem foto, a palheta da casa no lugar da inicial;
   - as caixinhas viraram chaves, com uma linha dizendo o que cada uma faz;
   - a senha tem o olho para conferir o que se digitou;
   - excluir pergunta na janela da casa (no ar era o confirm do
     navegador); o autor com post publicado não se exclui (o manual do ar
     diz), então a janela explica isso em vez de oferecer um Excluir.

   NO AR (31/10/2026): a API recusa excluir autor com QUALQUER post,
   publicado ou não. A senha no Editar passou a valer no mesmo dia (o PUT
   /authors/:id ganhou o campo; no painel antigo o que se digitava ali era
   ignorado): vazia mantém a atual.
   ========================================================================= */

type Rascunho = { id?: string; name: string; slug: string; email: string; password: string; bio: string; avatar: string; isAdmin: boolean; isAi: boolean };

function JanelaDoAutor({ inicial, aoSalvar, aoFechar }: {
  inicial: AutorDoPainel | null;
  aoSalvar: (a: AutorDoPainel) => void;
  aoFechar: () => void;
}) {
  const [a, setA] = useState<Rascunho>({
    id: inicial?.id, name: inicial?.name ?? '', slug: inicial?.slug ?? '', email: inicial?.email ?? '', password: '',
    bio: inicial?.bio ?? '', avatar: inicial?.avatar ?? '', isAdmin: !!inicial?.isAdmin, isAi: !!inicial?.isAi,
  });
  const [slugTocado, setSlugTocado] = useState(!!inicial);
  const [ver, setVer] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function ir(e: FormEvent) {
    e.preventDefault();
    if (!a.name.trim()) { setErro('Dê um nome ao autor.'); return; }
    if (!/^\S+@\S+\.\S+$/.test(a.email)) { setErro('Confira o e-mail.'); return; }
    if ((!inicial || a.password) && a.password.length < 6) { setErro('A senha precisa de pelo menos 6 caracteres.'); return; }
    setErro(''); setSalvando(true);
    const r = await salvarAutor({
      id: a.id, name: a.name.trim(), slug: a.slug || slugar(a.name), email: a.email.trim(), password: a.password || undefined,
      bio: a.bio || null, avatar: a.avatar || null, isAdmin: a.isAdmin, isAi: a.isAi,
    });
    setSalvando(false);
    if (!r.ok) { setErro(r.erro); return; }
    aoSalvar({ ...r.valor, postCount: inicial?.postCount ?? 0 });
  }

  return (
    <Janela titulo={inicial ? 'Editar Autor' : 'Novo Autor'} aoFechar={aoFechar} larga
      rodape={<>
        <button type="button" className="adm-bt" onClick={aoFechar}>Cancelar</button>
        <button type="submit" form="adm-autor-form" className="adm-bt cheio" disabled={salvando}>
          {salvando ? <><span className="adm-giro" aria-hidden="true" />Salvando...</> : inicial ? 'Salvar' : 'Criar'}
        </button>
      </>}>
      <form id="adm-autor-form" className="adm-form-janela adm-form-autor" onSubmit={ir}>
        <div className="adm-autor-foto">
          <span className="adm-campo-rot">Avatar</span>
          <Solta rotulo="Avatar" valor={a.avatar} aoMudar={(v) => setA({ ...a, avatar: v })} proporcao="1 / 1" texto="Foto" dica="Quadrada" />
        </div>
        <div className="adm-form-janela">
          <div className="adm-campo">
            <label htmlFor="adm-autor-nome">Nome</label>
            <input id="adm-autor-nome" className="adm-entrada" value={a.name} aria-invalid={erro && !a.name.trim() ? true : undefined}
              onChange={(e) => setA({ ...a, name: e.target.value, slug: slugTocado ? a.slug : slugar(e.target.value) })} />
          </div>
          <div className="adm-campo">
            <label htmlFor="adm-autor-slug">Slug</label>
            <input id="adm-autor-slug" className="adm-entrada adm-mono" value={a.slug}
              onChange={(e) => { setSlugTocado(true); setA({ ...a, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }); }} />
          </div>
        </div>
        <div className="adm-campo adm-largura-toda">
          <label htmlFor="adm-autor-email">Email</label>
          <input id="adm-autor-email" className="adm-entrada" type="email" autoComplete="off" placeholder="nome@tribhus.com.br" value={a.email}
            onChange={(e) => setA({ ...a, email: e.target.value })} />
        </div>
        <div className="adm-campo adm-largura-toda">
          <label htmlFor="adm-autor-senha">{inicial ? 'Nova senha' : 'Senha'}</label>
          <div className="adm-senha">
            <input id="adm-autor-senha" className="adm-entrada" type={ver ? 'text' : 'password'} autoComplete="new-password" value={a.password}
              onChange={(e) => setA({ ...a, password: e.target.value })} />
            <button type="button" className="adm-bt-ic mini" onClick={() => setVer(!ver)} aria-label={ver ? 'Esconder a senha' : 'Mostrar a senha'} aria-pressed={ver}>
              <Icone nome={ver ? 'esconder' : 'ver'} tamanho={17} />
            </button>
          </div>
          {inicial ? <p className="adm-ajuda">Deixe vazio para manter a senha atual.</p> : null}
        </div>
        <div className="adm-campo adm-largura-toda">
          <label htmlFor="adm-autor-bio">Bio</label>
          <textarea id="adm-autor-bio" className="adm-entrada" rows={3} value={a.bio} onChange={(e) => setA({ ...a, bio: e.target.value })} />
        </div>
        <div className="adm-chaves adm-largura-toda">
          <label className="adm-chave">
            <span>Administrador<small>Entra no painel e mexe em tudo.</small></span>
            <input type="checkbox" role="switch" checked={a.isAdmin} onChange={(e) => setA({ ...a, isAdmin: e.target.checked })} />
          </label>
          <label className="adm-chave">
            <span>Autor IA<small>Assina os artigos que a IA escreve.</small></span>
            <input type="checkbox" role="switch" checked={a.isAi} onChange={(e) => setA({ ...a, isAi: e.target.checked })} />
          </label>
        </div>
        {erro ? <p className="adm-erro adm-largura-toda" role="alert">{erro}</p> : null}
      </form>
    </Janela>
  );
}

export function Autores({ autores: iniciais }: { autores: AutorDoPainel[] }) {
  const router = useRouter();
  const [lista, setLista] = useState(iniciais);
  const [aberto, setAberto] = useState<AutorDoPainel | 'novo' | null>(null);
  const [excluir, setExcluir] = useState<AutorDoPainel | null>(null);

  return (
    <>
      <CabecaDaTela titulo="Autores"
        acao={<button type="button" className="adm-bt cheio" onClick={() => setAberto('novo')}><Icone nome="mais" tamanho={18} />Novo Autor</button>} />

      {lista.length ? (
        <ul className="adm-autores">
          {lista.map((a) => (
            <li key={a.id} className="adm-quadro adm-autor">
              <div className="adm-autor-topo">
                <Avatar src={a.avatar} tamanho={52} />
                <div className="adm-autor-quem">
                  <b>{a.name}</b>
                  <span className="adm-autor-selos">
                    {a.isAdmin ? <span className="adm-selo">Admin</span> : null}
                    {a.isAi ? <span className="adm-selo" data-ia>IA</span> : null}
                  </span>
                </div>
              </div>
              <p className="adm-autor-email">{a.email}</p>
              <p className="adm-autor-bio">{a.bio || <span>Sem bio.</span>}</p>
              <div className="adm-autor-pe">
                <span className="adm-autor-n">{numero(a.postCount ?? 0)} post{a.postCount === 1 ? '' : 's'}</span>
                <div className="adm-acoes">
                  <button type="button" className="adm-bt-ic" onClick={() => setAberto(a)} aria-label={`Editar ${a.name}`} title="Editar"><Icone nome="editar" tamanho={18} /></button>
                  <button type="button" className="adm-bt-ic" data-perigo onClick={() => setExcluir(a)} aria-label={`Excluir ${a.name}`} title="Excluir"><Icone nome="excluir" tamanho={18} /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="adm-quadro adm-vazio">
          <Icone nome="autores" tamanho={28} />
          <b>Nenhum autor encontrado</b>
          <button type="button" className="adm-bt cheio" onClick={() => setAberto('novo')}>Criar o primeiro</button>
        </div>
      )}

      {aberto ? (
        <JanelaDoAutor inicial={aberto === 'novo' ? null : aberto} aoFechar={() => setAberto(null)}
          aoSalvar={(a) => {
            const novo = aberto === 'novo';
            setLista((l) => (novo ? [...l, a] : l.map((x) => (x.id === a.id ? a : x))));
            setAberto(null);
            avisar(novo ? 'Autor criado' : 'Autor salvo');
            router.refresh();
          }} />
      ) : null}

      {excluir ? (
        excluir.postCount ? (
          <Confirmar
            titulo="Este autor tem posts"
            texto={<><b>{excluir.name}</b> assina {numero(excluir.postCount)} post{excluir.postCount > 1 ? 's' : ''}, e autor com post não pode ser excluído. Passe os posts para outro autor antes.</>}
            aoFechar={() => setExcluir(null)}
          />
        ) : (
          <Confirmar
            titulo="Excluir este autor?"
            texto={<><b>{excluir.name}</b> sai da lista de autores. Não dá para desfazer.</>}
            aoFechar={() => setExcluir(null)}
            aoConfirmar={async () => {
              const r = await excluirAutor(excluir.id);
              if (!r.ok) return r.erro;
              setLista((l) => l.filter((x) => x.id !== excluir.id));
              avisar('Autor excluído');
              router.refresh();
              return null;
            }}
          />
        )
      ) : null}
    </>
  );
}
