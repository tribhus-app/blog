'use client';

import { useRef, useState, type DragEvent } from 'react';
import { enviarImagem } from './acoes';
import { Icone } from './icones';

/* =========================================================================
   SOLTAR A IMAGEM: a capa, a imagem das redes (OG) e a imagem do texto

   "Arraste ou clique", como no ar. Ao soltar, a própria imagem aparece na
   hora (lida no navegador) e a barra de envio corre por cima dela; quando
   o servidor devolve o endereço, a imagem fica. Com imagem, o quadro
   mostra Trocar e Remover. O erro aparece embaixo, em âmbar, e a imagem
   que já estava continua.
   ========================================================================= */

export function Solta({ valor, aoMudar, texto = 'Arraste ou clique', dica, proporcao = '16 / 10', rotulo }: {
  valor: string;
  aoMudar: (url: string) => void;
  texto?: string;
  dica?: string;
  /** A forma do quadro (a capa do blog é quadrada; a OG, 1200x630). */
  proporcao?: string;
  rotulo: string;
}) {
  const campo = useRef<HTMLInputElement>(null);
  const [previa, setPrevia] = useState('');
  const [pct, setPct] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const [sobre, setSobre] = useState(false);

  async function receber(arquivo?: File | null) {
    if (!arquivo) return;
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(arquivo.type)) { setErro('Use PNG, JPG, GIF ou WebP.'); return; }
    setErro(''); setPrevia(URL.createObjectURL(arquivo)); setPct(0);
    const r = await enviarImagem(arquivo, setPct);
    setPct(null); setPrevia('');
    if (r.ok) aoMudar(r.valor.url); else setErro(r.erro);
  }
  function soltar(e: DragEvent) { e.preventDefault(); setSobre(false); receber(e.dataTransfer.files?.[0]); }

  const mostra = previa || valor;
  return (
    <div className="adm-solta-campo">
      <div className="adm-solta" style={{ aspectRatio: proporcao }} data-sobre={sobre ? '' : undefined} data-cheia={mostra ? '' : undefined}
        onDragOver={(e) => { e.preventDefault(); setSobre(true); }} onDragLeave={() => setSobre(false)} onDrop={soltar}>
        {mostra ? <img src={mostra} alt="" /> : null}
        {!mostra ? (
          <button type="button" className="adm-solta-vazia" onClick={() => campo.current?.click()} aria-label={`${rotulo}: ${texto}`}>
            <Icone nome="enviar" tamanho={22} />
            <b>{texto}</b>
            {dica ? <small>{dica}</small> : null}
          </button>
        ) : pct === null ? (
          <div className="adm-solta-bts">
            <button type="button" className="adm-bt claro" onClick={() => campo.current?.click()}>Trocar</button>
            <button type="button" className="adm-bt-ic" data-perigo onClick={() => aoMudar('')} aria-label={`Remover ${rotulo.toLowerCase()}`} title="Remover"><Icone nome="excluir" tamanho={18} /></button>
          </div>
        ) : null}
        {pct !== null ? (
          <div className="adm-solta-envio" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Enviando a imagem">
            <span>Enviando...</span>
            <i style={{ ['--p' as string]: pct / 100 }} />
          </div>
        ) : null}
        <input ref={campo} type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden onChange={(e) => { receber(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      {erro ? <p className="adm-erro" role="alert">{erro}</p> : null}
    </div>
  );
}
