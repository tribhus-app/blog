/**
 * geoLocation.ts
 *
 * Resolucao de geolocalizacao por IP, reaproveitada do GeoLocationService do
 * Tribhus (/opt/backend/utils/GeoLocationService.ts). Usa ip-api.com (gratis,
 * sem API key, 45 req/min) com cache em memoria de 24h.
 *
 * Aqui usamos o fetch nativo do Node 20 (sem axios) para nao adicionar deps.
 */

export interface GeoLocation {
  city: string | null
  state: string | null
  country: string | null
  countryCode: string | null
  lat?: number
  lon?: number
  /**
   * IP de datacenter/hospedagem ou de VPN/proxy. Crawler que se apresenta com
   * user-agent de Chrome comum escapa do BOT_REGEX, mas nao consegue esconder
   * de onde sai: Alibaba Cloud, Baidu, Meta e Googlebot cairam todos aqui.
   * Ver utils/analytics.ts e o filtro is_bot do analytics.
   */
  hosting: boolean
  proxy: boolean
  /** ASN + nome da rede (ex: "AS15169 Google LLC"), so para auditoria. */
  asn: string | null
}

interface IpApiResponse {
  status: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  lat: number
  lon: number
  query: string
  hosting?: boolean
  proxy?: boolean
  as?: string
}

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h
const API_URL = 'http://ip-api.com/json'

const cache = new Map<string, GeoLocation>()
const cacheExpiry = new Map<string, number>()

const LOCAL_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^::1$/,
  /^fe80:/,
  /^localhost$/i,
  /^unknown$/i,
]

function isLocalIP(ip: string): boolean {
  if (!ip) return true
  return LOCAL_PATTERNS.some((p) => p.test(ip))
}

function cleanExpiredCache(): void {
  const now = Date.now()
  for (const [ip, expiry] of cacheExpiry.entries()) {
    if (expiry < now) {
      cache.delete(ip)
      cacheExpiry.delete(ip)
    }
  }
}

/** Resolve um IP em cidade/estado/pais. Retorna null se local ou falhar. */
export async function getLocation(ip: string): Promise<GeoLocation | null> {
  try {
    if (isLocalIP(ip)) return null

    const cached = cache.get(ip)
    const expiry = cacheExpiry.get(ip)
    if (cached && expiry && expiry > Date.now()) return cached

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const url = `${API_URL}/${encodeURIComponent(ip)}?fields=status,country,countryCode,region,regionName,city,lat,lon,query,hosting,proxy,as`

    let data: IpApiResponse
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) return null
      data = (await res.json()) as IpApiResponse
    } finally {
      clearTimeout(timeout)
    }

    if (data.status !== 'success') return null

    const location: GeoLocation = {
      city: data.city || null,
      state: data.regionName || null,
      country: data.country || null,
      countryCode: data.countryCode || null,
      lat: data.lat,
      lon: data.lon,
      hosting: data.hosting === true,
      proxy: data.proxy === true,
      asn: data.as || null,
    }

    cache.set(ip, location)
    cacheExpiry.set(ip, Date.now() + CACHE_TTL)
    if (Math.random() < 0.1) cleanExpiredCache()

    return location
  } catch {
    // ip-api fora do ar / timeout / IP invalido — segue sem geo
    return null
  }
}
