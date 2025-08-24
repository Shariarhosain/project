import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directories exist
const uploadDir = path.join(process.cwd(), 'uploads', 'products');
const thumbDir = path.join(uploadDir, 'thumbs');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(thumbDir)) {
  fs.mkdirSync(thumbDir, { recursive: true });
}

// Multer configuration
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WebP, and GIF images are allowed'), false);
  }
};

export const uploadImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Max 10 files
  }
}).array('images', 10);

// Image processing function
export const processImages = async (files: Express.Multer.File[], req?: any) => {
  const processedImages = [];

  // Get server URL from environment or request
  const getServerUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return process.env.PRODUCTION_URL;
    }
    
    if (req) {
      // Construct URL from request
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:3000';
      return `${protocol}://${host}`;
    }
    
    return process.env.SERVER_URL || 'http://localhost:3000';
  };

  const serverUrl = getServerUrl();

  for (const file of files) {
    const fileName = `${uuidv4()}.jpg`;
    const filePath = path.join(uploadDir, fileName);
    const thumbPath = path.join(thumbDir, fileName);

    // Process main image
    const imageInfo = await sharp(file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filePath);

    // Create thumbnail
    await sharp(file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);

    processedImages.push({
      id: `img_${uuidv4()}`,
      url: `${serverUrl}/uploads/products/${fileName}`,
      thumbnail: `${serverUrl}/uploads/products/thumbs/${fileName}`,
      alt_text: file.originalname.split('.')[0],
      size: imageInfo.size,
      width: imageInfo.width,
      height: imageInfo.height,
      format: 'jpeg'
    });
  }

  return processedImages;
};
