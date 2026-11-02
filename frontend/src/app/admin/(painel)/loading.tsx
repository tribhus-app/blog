// Enquanto a pagina do painel busca os dados no servidor.
export default function Carregando() {
  return (
    <div className="adm-vazio" role="status">
      <span className="adm-giro" aria-hidden="true" />
      <span>Carregando...</span>
    </div>
  )
}
