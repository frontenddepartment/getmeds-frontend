// Shared client-side guard for prescription/ID/attachment uploads (order-medicines,
// product-detail). The `accept` attribute on <input type="file"> is only a picker
// hint and is trivially bypassed (drag-and-drop, "All Files"), so real enforcement
// happens here too — and again on the backend, since client-side checks can always
// be skipped entirely by calling the API directly.

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
export const ALLOWED_FILE_TYPES_ACCEPT = ALLOWED_FILE_EXTENSIONS.join(',');
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB per file
export const MAX_FILE_SIZE_LABEL = '10MB';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex === -1 ? '' : fileName.slice(dotIndex).toLowerCase();
}

export function isFileTypeAllowed(file: File): boolean {
  if (!ALLOWED_FILE_EXTENSIONS.includes(getExtension(file.name))) return false;
  // Some browsers/OSes leave `file.type` blank for docx and a few image formats —
  // only reject on a mismatch when a type WAS reported, rather than trusting an
  // empty type as a bypass.
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) return false;
  return true;
}

export interface FileValidationResult {
  valid: File[];
  errors: string[];
}

export function validateFiles(files: File[]): FileValidationResult {
  const valid: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    if (!isFileTypeAllowed(file)) {
      errors.push(`"${file.name}" isn't an allowed file type. Allowed: PDF, DOCX, PNG, JPG, JPEG, GIF, WEBP, BMP.`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`"${file.name}" is larger than the ${MAX_FILE_SIZE_LABEL} limit.`);
      continue;
    }
    if (file.size === 0) {
      errors.push(`"${file.name}" is empty.`);
      continue;
    }
    valid.push(file);
  }

  return { valid, errors };
}
