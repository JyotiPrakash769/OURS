/**
 * Compresses and resizes an image file to WebP client-side before uploading.
 * Reduces storage usage, speeds up mobile uploads, and prevents high memory usage.
 */
export async function compressImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<{ blob: Blob; mimeType: string }> {
  return new Promise((resolve, reject) => {
    // If the file is not an image, reject
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file.'))
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not process image on canvas.'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Try webp first
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, mimeType: 'image/webp' })
          } else {
            // Fallback to jpeg
            canvas.toBlob(
              (jpegBlob) => {
                if (jpegBlob) {
                  resolve({ blob: jpegBlob, mimeType: 'image/jpeg' })
                } else {
                  reject(new Error('Image conversion failed.'))
                }
              },
              'image/jpeg',
              quality,
            )
          }
        },
        'image/webp',
        quality,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image for processing.'))
    }

    img.src = url
  })
}
