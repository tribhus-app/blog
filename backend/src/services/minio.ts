import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'stream'

const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || 'https://127.0.0.1:9000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || '',
    secretAccessKey: process.env.MINIO_SECRET_KEY || '',
  },
  forcePathStyle: true,
  tls: true,
  // Ignore self-signed certificate
  requestHandler: {
    httpsAgent: new (require('https').Agent)({
      rejectUnauthorized: false
    })
  } as any
})

const BUCKET_NAME = process.env.MINIO_BUCKET || 'blog-images'
// URL pública para servir imagens (via proxy Nginx para SSL válido)
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'https://blog.tribhus.com.br/minio-images'

export interface UploadResult {
  url: string
  key: string
}

export async function uploadImage(
  file: Buffer | Readable,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const key = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    },
  })

  await upload.done()

  return {
    url: `${PUBLIC_URL}/${key}`,
    key,
  }
}

export async function uploadImageFromUrl(imageUrl: string): Promise<UploadResult> {
  const https = require('https')
  const http = require('http')

  return new Promise((resolve, reject) => {
    const protocol = imageUrl.startsWith('https') ? https : http

    protocol.get(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TribhusBlog/1.0)'
      },
      rejectUnauthorized: false
    }, (response: any) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        uploadImageFromUrl(response.headers.location).then(resolve).catch(reject)
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch image: ${response.statusCode}`))
        return
      }

      const contentType = response.headers['content-type'] || 'image/jpeg'
      const urlParts = imageUrl.split('/')
      const originalFilename = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg'

      const chunks: Buffer[] = []
      response.on('data', (chunk: Buffer) => chunks.push(chunk))
      response.on('end', async () => {
        try {
          const buffer = Buffer.concat(chunks)
          const result = await uploadImage(buffer, originalFilename, contentType)
          resolve(result)
        } catch (err) {
          reject(err)
        }
      })
      response.on('error', reject)
    }).on('error', reject)
  })
}

export async function deleteImage(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await s3Client.send(command)
}

export { s3Client, BUCKET_NAME }
