/**
 * Helpers de analytics first-party do blog.
 * Sem dependencias externas: parsing de user-agent e classificacao de fonte
 * de trafego sao feitos por heuristica (suficiente e privado).
 */

const BOT_REGEX =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|discordbot|headless|phantom|puppeteer|playwright|python-requests|axios\/|node-fetch|curl\/|wget|googlebot|google-inspectiontool|mediapartners|adsbot|ahrefs|semrush|mj12bot|dotbot|petalbot|yandex|baiduspider|applebot|duckduckbot|gptbot|claudebot|ccbot|bytespider|amazonbot/i

export interface ParsedUA {
  isBot: boolean
  deviceType: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
}

export function parseUserAgent(ua: string | undefined | null): ParsedUA {
  const s = ua || ''

  const isBot = BOT_REGEX.test(s)

  // Device
  let deviceType: ParsedUA['deviceType'] = 'desktop'
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(s)) deviceType = 'tablet'
  else if (/mobi|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini/i.test(s))
    deviceType = 'mobile'

  // OS
  let os = 'Outro'
  if (/windows nt/i.test(s)) os = 'Windows'
  else if (/iphone|ipad|ipod/i.test(s)) os = 'iOS'
  else if (/mac os x/i.test(s)) os = 'macOS'
  else if (/android/i.test(s)) os = 'Android'
  else if (/linux/i.test(s)) os = 'Linux'
  else if (/cros/i.test(s)) os = 'ChromeOS'

  // Browser (ordem importa: Edge/Opera/Samsung antes de Chrome; Chrome antes de Safari)
  let browser = 'Outro'
  if (/edg(a|ios|e)?\//i.test(s)) browser = 'Edge'
  else if (/opr\/|opera/i.test(s)) browser = 'Opera'
  else if (/samsungbrowser/i.test(s)) browser = 'Samsung'
  else if (/firefox|fxios/i.test(s)) browser = 'Firefox'
  else if (/chrome|crios|chromium/i.test(s)) browser = 'Chrome'
  else if (/safari/i.test(s)) browser = 'Safari'

  return { isBot, deviceType, browser, os }
}

/**
 * Classifica a origem do trafego a partir do referer + utm.
 * Foco em SEO: separa busca organica, Google Discover, social, etc.
 */
export function classifySource(
  referer: string | undefined | null,
  utmSource: string | undefined | null,
  utmMedium: string | undefined | null,
  selfHost: string
): string {
  const utm = (utmSource || '').toLowerCase()
  const med = (utmMedium || '').toLowerCase()

  // Google Discover normalmente chega via app do Google ou sem query de busca.
  if (utm.includes('discover') || med.includes('discover')) return 'google_discover'

  // UTM explicito ganha prioridade na atribuicao
  if (utm) {
    if (utm.includes('newsletter') || med === 'email') return 'email'
    if (/instagram|facebook|fb|twitter|x\.com|tiktok|youtube|linkedin|whatsapp|reddit/.test(utm))
      return 'social_' + utm.replace(/[^a-z]/g, '').slice(0, 20)
    if (med === 'cpc' || med === 'paid' || med.includes('ads')) return 'paid'
  }

  const ref = (referer || '').trim()
  if (!ref) return 'direct'

  let host = ''
  try {
    host = new URL(ref).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    // referers tipo "android-app://com.google.android.googlequicksearchbox"
    if (/googlequicksearchbox|com\.google\.android/i.test(ref)) return 'google_discover'
    return 'referral'
  }

  if (host === selfHost.replace(/^www\./, '')) return 'internal'

  // Buscadores
  if (/(^|\.)google\./.test(host) || host.includes('googleapis')) return 'organic_google'
  if (host.includes('bing.')) return 'organic_bing'
  if (host.includes('duckduckgo')) return 'organic_duckduckgo'
  if (/(^|\.)(yahoo|ecosia|brave|yandex|baidu|qwant|startpage)\./.test(host))
    return 'organic_other'

  // Social
  if (host.includes('instagram')) return 'social_instagram'
  if (/facebook|fb\.com|fb\.me|l\.facebook/.test(host)) return 'social_facebook'
  if (/t\.co|twitter|x\.com/.test(host)) return 'social_x'
  if (host.includes('tiktok')) return 'social_tiktok'
  if (host.includes('youtube') || host.includes('youtu.be')) return 'social_youtube'
  if (host.includes('linkedin') || host.includes('lnkd.in')) return 'social_linkedin'
  if (/whatsapp|wa\.me/.test(host)) return 'social_whatsapp'
  if (host.includes('reddit')) return 'social_reddit'
  if (host.includes('t.me') || host.includes('telegram')) return 'social_telegram'

  return 'referral'
}

/** Extrai o IP real respeitando o proxy reverso (nginx). */
export function extractIp(req: { headers: Record<string, any>; ip?: string }): string {
  const fwd = req.headers['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return req.ip || 'unknown'
}

const PERIOD_DAYS: Record<string, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '365d': 365,
}

/** Converte o parametro period em uma data de corte (null = todo o periodo). */
export function periodToSince(period: string | undefined): Date | null {
  if (!period || period === 'all') return null
  const days = PERIOD_DAYS[period] ?? 30
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}
