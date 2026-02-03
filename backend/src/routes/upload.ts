import { Router, Request, Response } from 'express'
import multer from 'multer'
import { uploadImage, uploadImageFromUrl, deleteImage } from '../services/minio'

const router = Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de arquivo nao permitido. Use JPEG, PNG, GIF ou WebP.'))
    }
  },
})

// Upload single image
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' })
    }

    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )

    res.json({
      success: true,
      url: result.url,
      key: result.key,
    })
  } catch (error) {
    console.error('Erro no upload:', error)
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' })
  }
})

// Upload image from URL
router.post('/from-url', async (req: Request, res: Response) => {
  try {
    const { url } = req.body

    if (!url) {
      return res.status(400).json({ error: 'URL da imagem nao fornecida' })
    }

    const result = await uploadImageFromUrl(url)

    res.json({
      success: true,
      url: result.url,
      key: result.key,
    })
  } catch (error) {
    console.error('Erro no upload from URL:', error)
    res.status(500).json({ error: 'Erro ao fazer upload da imagem pela URL' })
  }
})

// Delete image
router.delete('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params

    await deleteImage(key)

    res.json({
      success: true,
      message: 'Imagem deletada com sucesso',
    })
  } catch (error) {
    console.error('Erro ao deletar:', error)
    res.status(500).json({ error: 'Erro ao deletar imagem' })
  }
})

export default router
