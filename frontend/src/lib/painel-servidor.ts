import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { chamarApi, type UsuarioDaApi } from './painel'

/* =========================================================================
   O QUE AS PAGINAS DO PAINEL LEEM NO SERVIDOR

   As paginas de app/admin/(painel) leem a API do blog no servidor, com o
   token do cookie `admin_token` (o mesmo que o navegador grava ao entrar).
   Sessao ruim (sem token, token vencido, quem nao e admin) vai para
   /admin/sair, que apaga o cookie e manda para o login: um componente de
   servidor nao pode apagar cookie, e o middleware devolveria /admin/login
   para /admin enquanto o cookie existisse.

   So para o servidor: importa next/headers. As acoes do navegador ficam em
   components/blog-admin/acoes.ts.
   ========================================================================= */

export const token = () => cookies().get('admin_token')?.value

/** Quem esta logado, ou /admin/sair. */
export async function usuarioDoPainel(): Promise<UsuarioDaApi> {
  const t = token()
  if (!t) redirect('/admin/sair')
  const r = await chamarApi<{ user: UsuarioDaApi }>(t, '/auth/me', { cache: 'no-store' })
  if (!r.ok || !r.valor.user?.isAdmin) redirect('/admin/sair')
  return r.valor.user
}

/** Le um caminho da API. 401/403 vao para /admin/sair, 404 para o
 *  "nao encontrado" (so quando pedido) e o resto vira erro da tela. */
export async function ler<T>(caminho: string, opcoes: { naoEncontrado?: boolean } = {}): Promise<T> {
  const r = await chamarApi<T>(token(), caminho, { cache: 'no-store' })
  if (r.ok) return r.valor
  if (r.status === 401 || r.status === 403) redirect('/admin/sair')
  if (r.status === 404 && opcoes.naoEncontrado) notFound()
  throw new Error(r.erro)
}
