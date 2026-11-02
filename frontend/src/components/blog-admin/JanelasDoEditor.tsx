'use client';

import { useState, type FormEvent } from 'react';
import { Janela } from './pecas';
import { Solta } from './Solta';

/* =========================================================================
   AS TRÊS JANELAS DA BARRA: imagem, vídeo e link

   As mesmas do ar ("Inserir Imagem", "Inserir Video"), na janela da casa.
   A de vídeo mostra a prévia assim que o endereço é do YouTube ou do
   Vimeo, e só deixa inserir quando é. A de link é nova no desenho e não
   no comportamento: no ar o botão de link abria o `prompt()` do navegador.
   ========================================================================= */

export function JanelaDeImagem({ aoInserir, aoFechar }: { aoInserir: (url: string) => void; aoFechar: () => void }) {
  const [url, setUrl] = useState('');
  return (
    <Janela titulo="Inserir Imagem" aoFechar={aoFechar}
      rodape={<>
        <button type="button" className="adm-bt" onClick={aoFechar}>Cancelar</button>
        <button type="button" className="adm-bt cheio" disabled={!url} onClick={() => { aoInserir(url); aoFechar(); }}>Inserir</button>
      </>}>
      <Solta rotulo="Imagem" valor={url} aoMudar={setUrl} dica="PNG, JPG, GIF ou WebP (máx. 10 MB)" />
    </Janela>
  );
}

export function idDoVideo(endereco: string): { tipo: 'youtube' | 'vimeo'; id: string } | null {
  const yt = endereco.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { tipo: 'youtube', id: yt[1] };
  const vi = endereco.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return vi ? { tipo: 'vimeo', id: vi[1] } : null;
}

export function JanelaDeVideo({ aoInserir, aoFechar }: { aoInserir: (url: string) => void; aoFechar: () => void }) {
  const [url, setUrl] = useState('');
  const v = idDoVideo(url);
  function ir(e: FormEvent) { e.preventDefault(); if (v) { aoInserir(url.trim()); aoFechar(); } }
  return (
    <Janela titulo="Inserir Vídeo" aoFechar={aoFechar}
      rodape={<>
        <button type="button" className="adm-bt" onClick={aoFechar}>Cancelar</button>
        <button type="submit" form="adm-video" className="adm-bt cheio" disabled={!v}>Inserir</button>
      </>}>
      <form id="adm-video" className="adm-campo" onSubmit={ir}>
        <label htmlFor="adm-video-url">URL do vídeo (YouTube ou Vimeo)</label>
        <input id="adm-video-url" className="adm-entrada" type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=..."
          value={url} onChange={(e) => setUrl(e.target.value)} aria-invalid={url.trim() && !v ? true : undefined} />
        {url.trim() && !v ? <p className="adm-erro">Esse endereço não é de um vídeo do YouTube ou do Vimeo.</p> : null}
      </form>
      {v ? (
        <div className="adm-video-previa">
          <p className="adm-rotulo">Prévia</p>
          {v.tipo === 'youtube'
            ? <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" />
            : <div className="adm-video-vimeo">Vídeo do Vimeo · {v.id}</div>}
        </div>
      ) : null}
    </Janela>
  );
}

export function JanelaDeLink({ inicial, aoInserir, aoRemover, aoFechar }: {
  inicial: string;
  aoInserir: (url: string) => void;
  aoRemover: () => void;
  aoFechar: () => void;
}) {
  const [url, setUrl] = useState(inicial);
  function ir(e: FormEvent) { e.preventDefault(); if (url.trim()) { aoInserir(url.trim()); aoFechar(); } }
  return (
    <Janela titulo={inicial ? 'Editar link' : 'Inserir link'} aoFechar={aoFechar}
      rodape={<>
        {inicial ? <button type="button" className="adm-bt" onClick={() => { aoRemover(); aoFechar(); }}>Remover link</button> : null}
        <button type="button" className="adm-bt" onClick={aoFechar}>Cancelar</button>
        <button type="submit" form="adm-link" className="adm-bt cheio" disabled={!url.trim()}>{inicial ? 'Salvar' : 'Inserir'}</button>
      </>}>
      <form id="adm-link" className="adm-campo" onSubmit={ir}>
        <label htmlFor="adm-link-url">Endereço</label>
        <input id="adm-link-url" className="adm-entrada" type="url" inputMode="url" placeholder="https://" value={url} onChange={(e) => setUrl(e.target.value)} />
        <p className="adm-ajuda">Selecione o texto antes de clicar no link.</p>
      </form>
    </Janela>
  );
}
