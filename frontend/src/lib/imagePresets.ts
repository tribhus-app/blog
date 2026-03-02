export const imagePresets = {
  hero: {
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px',
    priority: true as const,
    quality: 85,
  },
  cardLarge: {
    sizes: '(max-width: 1023px) 100vw, (max-width: 1280px) 66vw, 800px',
    quality: 75,
  },
  cardDefault: {
    sizes: '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 384px',
    quality: 75,
  },
  cardHorizontal: {
    sizes: '96px',
    quality: 70,
  },
  thumbSmall: {
    width: 40,
    height: 40,
    quality: 60,
  },
  content: {
    sizes: '(max-width: 768px) 100vw, 800px',
    quality: 80,
  }
}
