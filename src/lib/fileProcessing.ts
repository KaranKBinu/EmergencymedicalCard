/**
 * Renames a file to be web-compatible by:
 * 1. Converting to lowercase
 * 2. Replacing spaces and special characters with hyphens
 * 3. Removing multiple consecutive hyphens
 */
export const makeWebCompatibleFilename = (filename: string): string => {
  const lastDotIndex = filename.lastIndexOf('.');
  // Handle files without an extension
  if (lastDotIndex === -1) {
      return filename.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 8);
  }

  const name = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex).toLowerCase();

  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Trim hyphens from start and end

  // generate a small random hash to prevent naming collisions
  const hash = Math.random().toString(36).substring(2, 8);
  return `${safeName}-${hash}${extension}`;
};

/**
 * Compresses an image file using HTML5 Canvas
 * @param file The original image File object
 * @param maxWidth The maximum width for the compressed image
 * @param quality Quality from 0.0 to 1.0 (defaults to 0.8)
 * @returns A Promise that resolves to the compressed File
 */
export const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If it's not an image (e.g. a PDF document), skip compression
    if (!file.type.startsWith('image/')) {
      resolve(file); 
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            // Use WebP for better web compression if possible, otherwise stick to original format type 
            // fallback to jpeg if original format is not supported for aggressive compression
            const mimeType = 'image/webp';
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          quality
        );
      };
      
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Main utility function to process any file (document or image) before upload.
 * It will rename the file and compress it if it's an image.
 */
export const processFileForWeb = async (file: File): Promise<File> => {
  const safeFilename = makeWebCompatibleFilename(file.name);
  
  // If it's an image, compress it and rename it
  if (file.type.startsWith('image/')) {
    const compressedFile = await compressImage(file);
    
    // The compressed file is now a WebP, so we should change the extension to .webp
    const finalFilename = safeFilename.substring(0, safeFilename.lastIndexOf('.')) + '.webp';
    return new File([compressedFile], finalFilename, { type: compressedFile.type });
  }

  // If it's a document (PDF, etc), just rename it
  return new File([file], safeFilename, { type: file.type });
};
