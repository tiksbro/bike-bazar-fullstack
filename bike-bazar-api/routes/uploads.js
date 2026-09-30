const express = require('express')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

// Cloudinary reads these 3 keys from bike-bazar-api/.env (never put them in the frontend)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_PHOTOS = 6
const MAX_FILE_SIZE_MB = 5
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const CLOUDINARY_FOLDER = 'bike-bazar'

// multer keeps each file in memory (as a Buffer) just long enough to send it to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: MAX_PHOTOS },
  fileFilter: (req, file, callback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      callback(null, true)
    } else {
      callback(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'badType'))
    }
  },
}).array('photos', MAX_PHOTOS)

function getFriendlyUploadError(err) {
  if (err.field === 'badType') return 'Only JPG, PNG or WebP photos are allowed.'
  if (err.code === 'LIMIT_FILE_SIZE') return `Each photo must be smaller than ${MAX_FILE_SIZE_MB} MB.`
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return `You can upload at most ${MAX_PHOTOS} photos.`
  }
  return 'Could not read the uploaded photos.'
}

// Sends one photo (a Buffer) to Cloudinary and resolves with its url + publicId
function uploadBufferToCloudinary(fileBuffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: CLOUDINARY_FOLDER,
        resource_type: 'image',
        // shrink big phone photos so pages load fast
        transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error)
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    uploadStream.end(fileBuffer)
  })
}

// Deletes photos from Cloudinary (used when a listing is deleted). Never throws.
async function deletePhotosFromCloudinary(photos = []) {
  await Promise.all(
    photos.map((photo) =>
      cloudinary.uploader.destroy(photo.publicId).catch((err) => {
        console.error('Failed to delete photo from Cloudinary:', photo.publicId, err.message)
      })
    )
  )
}

// POST /api/uploads  (form field name: "photos", 1 to 6 files)
router.post('/', requireAuth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: getFriendlyUploadError(err) })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Please choose at least 1 photo.' })
    }

    try {
      const photos = await Promise.all(req.files.map((file) => uploadBufferToCloudinary(file.buffer)))
      res.status(201).json({ photos })
    } catch (uploadErr) {
      console.error('Cloudinary upload failed:', uploadErr.message)
      res.status(502).json({ error: 'Photo upload failed. Please try again.' })
    }
  })
})

module.exports = router
module.exports.deletePhotosFromCloudinary = deletePhotosFromCloudinary
