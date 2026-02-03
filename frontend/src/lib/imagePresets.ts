export const imagePresets = {
  hero: {
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px',
    priority: true,
    quality: 75,
  },
  cardLarge: {
    sizes: '(max-width: 768px) 95vw, (max-width: 1200px) 66vw, 800px',
    quality: 60,
  },
  cardDefault: {
    sizes: '(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 384px',
    quality: 60,
  },
  cardHorizontal: {
    sizes: '(max-width: 640px) 96px, 96px',
    quality: 60,
  },
  thumbSmall: {
    width: 40,
    height: 40,
    quality: 60,
  },
  content: {
    sizes: '(max-width: 768px) 100vw, 800px',
    quality: 70,
  }
}
