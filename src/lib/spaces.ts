import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// DigitalOcean Spaces S3-compatible client
const s3Client = new S3Client({
  endpoint: `https://${process.env.DO_SPACES_ENDPOINT}`,
  region: 'us-east-1', // Required but not used by DO Spaces
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
  forcePathStyle: false,
});

const BUCKET = process.env.DO_SPACES_BUCKET || 'airporttransfer-files';
const CDN_URL = process.env.DO_SPACES_CDN || `https://${BUCKET}.ams3.cdn.digitaloceanspaces.com`;

// Allowed file types for documents
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

/**
 * Upload a file to DigitalOcean Spaces
 * @param file - The file buffer
 * @param filename - Original filename
 * @param contentType - MIME type
 * @param folder - Folder path (e.g., 'supplier-docs', 'driver-docs')
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
  folder: string = 'documents'
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(contentType)) {
    return {
      success: false,
      error: `Invalid file type. Allowed: PDF, JPEG, PNG, WebP, GIF`,
    };
  }

  // Validate file size
  if (file.length > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File too large. Maximum size: 10MB`,
    };
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const ext = filename.split('.').pop()?.toLowerCase() || 'pdf';
  const key = `${folder}/${timestamp}-${randomStr}.${ext}`;

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Make file publicly accessible
    });

    await s3Client.send(command);

    return {
      success: true,
      url: `${CDN_URL}/${key}`,
      key,
    };
  } catch (error) {
    console.error('Error uploading to Spaces:', error);
    return {
      success: false,
      error: 'Failed to upload file. Please try again.',
    };
  }
}

/**
 * Delete a file from DigitalOcean Spaces
 * @param key - The file key (path in bucket)
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting from Spaces:', error);
    return false;
  }
}

/**
 * Extract the key from a CDN URL
 */
export function getKeyFromUrl(url: string): string | null {
  if (!url.includes(CDN_URL) && !url.includes(BUCKET)) {
    return null;
  }

  // Extract path after the domain
  const urlObj = new URL(url);
  return urlObj.pathname.substring(1); // Remove leading slash
}
