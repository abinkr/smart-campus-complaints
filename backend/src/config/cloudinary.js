import { v2 as cloudinary } from 'cloudinary'
import { config } from './index.js'

cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary = (buffer, folder = 'campus-complaints') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    )

    stream.end(buffer)
  })

export { cloudinary }
