// Apaga o cookie do painel e manda para o login. Existe porque um componente
// de servidor nao pode apagar cookie: quando o layout do painel descobre que o
// token venceu (ou que a pessoa deixou de ser admin), ele redireciona para ca.
// Sem isso, o middleware ve o cookie em /admin/login e devolve para /admin,
// num vai e volta sem fim.
// O Location e relativo e ja leva o /blog (basePath): um Location relativo e
// valido, e nao depende do host que o proxy repassa.
export const dynamic = 'force-dynamic'

export function GET() {
  return new Response(null, {
    status: 307,
    headers: {
      Location: '/blog/admin/login',
      'Set-Cookie': 'admin_token=; Path=/; Max-Age=0; SameSite=Lax',
      'Cache-Control': 'no-store',
    },
  })
}
