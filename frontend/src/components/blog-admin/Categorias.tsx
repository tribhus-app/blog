'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { excluirCategoria, salvarCategoria } from './acoes';
import { CabecaDaTela, numero, slugar } from './comum';
import { Icone } from './icones';
import { Confirmar, Janela, avisar } from './pecas';
import type { CategoriaDoPainel } from './tipos';

/* =========================================================================
   CATEGORIAS (/admin/categories)

   Como no ar: "Nova Categoria" no alto à direita, e a tabela com Cor,
   Nome (a descrição embaixo), Slug, Posts e as ações Editar e Excluir.
   Nova e Editar abrem a mesma janela (Nome, Slug, Descrição, Cor). A cor
   é um dado do ar e fica: aqui ela aparece como amostra, porque é o que
   se edita; o blog público não pinta nada com ela.

   O que mudou:
   - o slug nasce do nome enquanto ninguém mexe nele;
   - a cor tem as oito do blog à mão e o campo hex do ar ao lado;
   - excluir pergunta na janela da casa (no ar era o confirm do
     navegador); a categoria com post não se exclui (o manual do ar diz),
     então a janela explica isso em vez de oferecer um Excluir que falha;
   - "Categoria criada" e "Categoria salva" aparecem embaixo e somem.

   NO AR (31/10/2026): a API faz o slug sozinha a partir do nome e ignora o
   que vier (POST e PUT de /categories), então o campo Slug só mostra o que
   vai sair, sem deixar escrever.
   ========================================================================= */

const CORES = ['#FF6A00', '#EF4444', '#F59E0B', '#22A65A', '#3B82F6', '#2563EB', '#8B5CF6', '#A855F7', '#949BA2'];

type Rascunho = { id?: string; name: string; slug: string; description: string; color: string };

function JanelaDaCategoria({ inicial, aoSalvar, aoFechar }: {
  inicial: CategoriaDoPainel | null;
  aoSalvar: (c: CategoriaDoPainel) => void;
  aoFechar: () => void;
}) {
  const [c, setC] = useState<Rascunho>({
    id: inicial?.id, name: inicial?.name ?? '', slug: inicial?.slug ?? '',
    description: inicial?.description ?? '', color: inicial?.color ?? '#FF6A00',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const hexOk = /^#[0-9a-f]{6}$/i.test(c.color);

  async function ir(e: FormEvent) {
    e.preventDefault();
    if (!c.name.trim()) { setErro('Dê um nome à categoria.'); return; }
    if (!hexOk) { setErro('A cor precisa ser um hex como #FF6A00.'); return; }
    setErro(''); setSalvando(true);
    const r = await salvarCategoria({ ...c, name: c.name.trim(), slug: c.slug || slugar(c.name), description: c.description || null });
    setSalvando(false);
    if (!r.ok) { setErro(r.erro); return; }
    aoSalvar({ ...r.valor, postCount: inicial?.postCount ?? 0 });
  }

  return (
    <Janela titulo={inicial ? 'Editar Categoria' : 'Nova Categoria'} aoFechar={aoFechar}
      rodape={<>
        <button type="button" className="adm-bt" onClick={aoFechar}>Cancelar</button>
        <button type="submit" form="adm-cat-form" className="adm-bt cheio" disabled={salvando}>
          {salvando ? <><span className="adm-giro" aria-hidden="true" />Salvando...</> : inicial ? 'Salvar' : 'Criar'}
        </button>
      </>}>
      <form id="adm-cat-form" className="adm-form-janela" onSubmit={ir}>
        <div className="adm-campo">
          <label htmlFor="adm-cat-nome">Nome</label>
          <input id="adm-cat-nome" className="adm-entrada" placeholder="Ex: Lançamentos" value={c.name} aria-invalid={erro && !c.name.trim() ? true : undefined}
            onChange={(e) => setC({ ...c, name: e.target.value, slug: inicial && e.target.value === inicial.name ? inicial.slug : slugar(e.target.value) })} />
        </div>
        <div className="adm-campo">
          <label htmlFor="adm-cat-slug">Slug</label>
          <div className="adm-prefixo">
            <span>/blog/categoria/</span>
            <input id="adm-cat-slug" className="adm-entrada" placeholder="lancamentos" value={c.slug} readOnly aria-describedby="adm-cat-slug-ajuda" />
          </div>
          <p className="adm-ajuda" id="adm-cat-slug-ajuda">Nasce do nome.</p>
        </div>
        <div className="adm-campo">
          <label htmlFor="adm-cat-desc">Descrição</label>
          <textarea id="adm-cat-desc" className="adm-entrada" rows={3} placeholder="Do que esta categoria trata" value={c.description}
            onChange={(e) => setC({ ...c, description: e.target.value })} />
        </div>
        <fieldset className="adm-campo adm-cor">
          <legend className="adm-campo-rot">Cor</legend>
          <div className="adm-cor-linha">
            <ul className="adm-cor-amostras">
              {CORES.map((x) => (
                <li key={x}>
                  <button type="button" style={{ background: x }} aria-label={x} aria-pressed={c.color.toLowerCase() === x.toLowerCase()}
                    onClick={() => setC({ ...c, color: x })} />
                </li>
              ))}
            </ul>
            <label className="adm-cor-hex">
              <span className="adm-cor-bola" style={{ background: hexOk ? c.color : 'transparent' }} aria-hidden="true" />
              <span className="adm-so-leitor">Cor em hex</span>
              <input className="adm-entrada" value={c.color} maxLength={7} spellCheck={false} aria-invalid={!hexOk || undefined}
                onChange={(e) => setC({ ...c, color: e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}` })} />
            </label>
          </div>
        </fieldset>
        {erro ? <p className="adm-erro" role="alert">{erro}</p> : null}
      </form>
    </Janela>
  );
}

export function Categorias({ categorias: iniciais }: { categorias: CategoriaDoPainel[] }) {
  const router = useRouter();
  const [lista, setLista] = useState(iniciais);
  const [aberta, setAberta] = useState<CategoriaDoPainel | 'nova' | null>(null);
  const [excluir, setExcluir] = useState<CategoriaDoPainel | null>(null);

  return (
    <>
      <CabecaDaTela titulo="Categorias"
        acao={<button type="button" className="adm-bt cheio" onClick={() => setAberta('nova')}><Icone nome="mais" tamanho={18} />Nova Categoria</button>} />

      <section className="adm-quadro">
        {lista.length ? (
          <div className="adm-tabela-rolagem">
            <table className="adm-tabela adm-tabela-cat">
              <thead>
                <tr><th scope="col">Cor</th><th scope="col">Nome</th><th scope="col">Slug</th><th scope="col" className="num">Posts</th><th scope="col"><span className="adm-so-leitor">Ações</span></th></tr>
              </thead>
              <tbody>
                {lista.map((c) => (
                  <tr key={c.id}>
                    <td><span className="adm-cor-bola" style={{ background: c.color ?? 'var(--cor-texto-4)' }} title={c.color ?? ''} /></td>
                    <td>
                      <div className="adm-cat-nome">
                        <b>{c.name}</b>
                        {c.description ? <small>{c.description}</small> : null}
                      </div>
                    </td>
                    <td className="mono">{c.slug}</td>
                    <td className="num">{numero(c.postCount ?? 0)}</td>
                    <td>
                      <div className="adm-acoes">
                        <button type="button" className="adm-bt-ic" onClick={() => setAberta(c)} aria-label={`Editar ${c.name}`} title="Editar"><Icone nome="editar" tamanho={18} /></button>
                        <button type="button" className="adm-bt-ic" data-perigo onClick={() => setExcluir(c)} aria-label={`Excluir ${c.name}`} title="Excluir"><Icone nome="excluir" tamanho={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="adm-vazio">
            <Icone nome="categorias" tamanho={28} />
            <b>Nenhuma categoria encontrada</b>
            <button type="button" className="adm-bt cheio" onClick={() => setAberta('nova')}>Criar a primeira</button>
          </div>
        )}
      </section>

      {aberta ? (
        <JanelaDaCategoria inicial={aberta === 'nova' ? null : aberta} aoFechar={() => setAberta(null)}
          aoSalvar={(c) => {
            const nova = aberta === 'nova';
            setLista((l) => (nova ? [...l, c] : l.map((x) => (x.id === c.id ? c : x))));
            setAberta(null);
            avisar(nova ? 'Categoria criada' : 'Categoria salva');
            router.refresh();
          }} />
      ) : null}

      {excluir ? (
        excluir.postCount ? (
          <Confirmar
            titulo="Esta categoria tem posts"
            texto={<><b>{excluir.name}</b> tem {numero(excluir.postCount)} post{excluir.postCount > 1 ? 's' : ''}, e categoria com post não pode ser excluída. Mude os posts para outra categoria antes.</>}
            aoFechar={() => setExcluir(null)}
          />
        ) : (
          <Confirmar
            titulo="Excluir esta categoria?"
            texto={<><b>{excluir.name}</b> sai do blog. Não dá para desfazer.</>}
            aoFechar={() => setExcluir(null)}
            aoConfirmar={async () => {
              const r = await excluirCategoria(excluir.id);
              if (!r.ok) return r.erro;
              setLista((l) => l.filter((x) => x.id !== excluir.id));
              avisar('Categoria excluída');
              router.refresh();
              return null;
            }}
          />
        )
      ) : null}
    </>
  );
}
