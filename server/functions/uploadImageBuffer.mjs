import { v2 as cloudinary } from 'cloudinary';

function cloudinaryClient() {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

/**
 * Upload an image buffer with the same options as POST /api/upload.
 * `filename` is an already sanitized public-id basename, or empty for a unique name.
 */
export function uploadImageBuffer(buffer, { filename = '', context } = {}) {
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'ayala-media';
  const publicId = filename ? `${folder}/${filename}` : '';

  return new Promise((resolve, reject) => {
    cloudinaryClient()
      .uploader.upload_stream(
        {
          resource_type: 'image',
          ...(publicId
            ? { public_id: publicId, use_filename: false, unique_filename: false }
            : { folder, use_filename: true, unique_filename: true }),
          format: 'webp',
          quality: 'auto',
          transformation: [{ width: 2000, crop: 'limit' }],
          ...(context ? { context } : {}),
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        }
      )
      .end(buffer);
  });
}
