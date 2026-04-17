const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Fallback to local disk storage if Cloudinary not configured
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY

const storage = useCloudinary
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'mindcare-activities',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'],
        resource_type: 'auto',
        transformation: [{ width: 1280, crop: 'limit' }],
      },
    })
  : multer.diskStorage({
      destination: 'uploads/',
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    })

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Invalid file type. Only images and videos allowed.'))
  }
})

module.exports = { upload, cloudinary }
