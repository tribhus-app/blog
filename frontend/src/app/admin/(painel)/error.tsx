'use client'

import { CabecaDaTela } from '@/components/blog-admin/comum'

// A API do blog falhou ao montar a tela (a sessao ruim ja foi para o login).
export default function ErroDoPainel({ reset }: { error: Error; reset: () => void }) {
  return (
    <>
      <CabecaDaTela titulo="Não deu para carregar" />
      <div className="adm-quadro adm-vazio">
        <b>A API do blog não respondeu como devia.</b>
        <span>Tente de novo em alguns segundos.</span>
        <button type="button" className="adm-bt cheio" onClick={reset}>Tentar de novo</button>
      </div>
    </>
  )
}
