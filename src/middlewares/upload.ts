import * as multer from 'multer';

/**
 * Multer configuration for file uploads
 * Uses memory storage to avoid writing to disk
 */

// File filter to validate file types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/json'
  ];

  const allowedExtensions = /\.(pdf|txt|md|doc|docx|csv|json)$/i;

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, TXT, MD, DOC, DOCX, CSV, and JSON files are allowed.'));
  }
};

// Configure multer with memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 16 * 1024 * 1024, // 16MB max file size
  },
  fileFilter: fileFilter,
});

export default upload;

