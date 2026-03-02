import { Request, Response } from 'express'

// Configuração de versões do app mobile
// Atualize estes valores quando publicar novas versões nas lojas
const APP_VERSION_CONFIG = {
  android: {
    minimum_version: '1.2.3',      // Abaixo disso = update crítico (bloqueante)
    recommended_version: '1.2.3',  // Abaixo disso = update recomendado
    current_version: '1.2.3',      // Versão mais recente na loja
    update_type: 'optional' as const,
    message: {
      pt: 'Nova versão disponível! Atualize para ter a melhor experiência.',
      en: 'New version available! Update for the best experience.',
    },
    changelog: [] as string[],
    stores: {
      android: 'https://play.google.com/store/apps/details?id=com.tribhus',
      ios: 'https://apps.apple.com/us/app/tribhus/id6739949821',
    },
  },
  ios: {
    minimum_version: '1.2.3',
    recommended_version: '1.2.3',
    current_version: '1.2.3',
    update_type: 'optional' as const,
    message: {
      pt: 'Nova versão disponível! Atualize para ter a melhor experiência.',
      en: 'New version available! Update for the best experience.',
    },
    changelog: [] as string[],
    stores: {
      android: 'https://play.google.com/store/apps/details?id=com.tribhus',
      ios: 'https://apps.apple.com/us/app/tribhus/id6739949821',
    },
  },
}

export const getAppVersion = (req: Request, res: Response) => {
  try {
    const platform = (req.query.platform as string)?.toLowerCase()
    const currentVersion = req.query.current_version as string

    console.log(`[AppVersion] Check - platform: ${platform}, current_version: ${currentVersion}`)

    if (!platform || !['android', 'ios'].includes(platform)) {
      return res.status(400).json({ error: 'Platform deve ser "android" ou "ios"' })
    }

    const config = APP_VERSION_CONFIG[platform as 'android' | 'ios']

    return res.json({
      minimum_version: config.minimum_version,
      recommended_version: config.recommended_version,
      current_version: config.current_version,
      update_type: config.update_type,
      message: config.message,
      changelog: config.changelog,
      stores: config.stores,
    })
  } catch (error) {
    console.error('[AppVersion] Erro:', error)
    return res.status(500).json({ error: 'Erro ao verificar versão' })
  }
}
