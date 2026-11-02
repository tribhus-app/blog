import { IA } from '@/components/blog-admin/IA'
import { CATEGORIAS_DA_IA, diaDaSemanaEmSaoPaulo, paraCalendario, paraEstadoDaIA, type SchedulerDaApi } from '@/lib/painel'
import { ler } from '@/lib/painel-servidor'

export const metadata = { title: 'IA | Painel | Tribhus Blog' }

// /ai/scheduler/status no servidor. O preview das noticias (/ai/news/preview)
// a tela busca no navegador, porque a API le os RSS na hora e pode demorar.
// /ai/jobs/status o painel antigo buscava e nao mostrava: ficou de fora.
export default async function Pagina() {
  const s = await ler<SchedulerDaApi>('/ai/scheduler/status')
  return (
    <IA estado={paraEstadoDaIA(s)} calendario={paraCalendario(s)} categorias={CATEGORIAS_DA_IA} noticias={null} hoje={diaDaSemanaEmSaoPaulo()} />
  )
}
