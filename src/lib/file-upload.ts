/**
 * File upload validation and security
 */

import { FileValidators, isValidFileType, isValidFileSize, sanitizeFileName } from "./sanitize";

export interface FileUploadResult {
  valid: boolean;
  error?: string;
  sanitizedFileName?: string;
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  validator: typeof FileValidators.image | typeof FileValidators.pdf | typeof FileValidators.document
): FileUploadResult {
  // Check file type
  if (!isValidFileType(file.name, validator.types)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${validator.types.join(", ")}`,
    };
  }

  // Check file size
  if (!isValidFileSize(file.size, validator.maxSize)) {
    const maxSizeMB = validator.maxSize / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  // Sanitize file name
  const sanitizedFileName = sanitizeFileName(file.name);

  return {
    valid: true,
    sanitizedFileName,
  };
}

/**
 * Validate image upload
 */
export function validateImageUpload(file: File): FileUploadResult {
  return validateFileUpload(file, FileValidators.image);
}

/**
 * Validate PDF upload
 */
export function validatePdfUpload(file: File): FileUploadResult {
  return validateFileUpload(file, FileValidators.pdf);
}

/**
 * Scan file for malicious content (basic check)
 * In production, use a proper antivirus/security scanner
 */
export async function scanFile(file: File): Promise<{ safe: boolean; reason?: string }> {
  // Basic checks
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check for executable signatures
  const executableSignatures = [
    [0x4d, 0x5a], // PE executable
    [0x7f, 0x45, 0x4c, 0x46], // ELF
    [0xca, 0xfe, 0xba, 0xbe], // Java class
  ];

  for (const signature of executableSignatures) {
    if (bytes.length >= signature.length) {
      let match = true;
      for (let i = 0; i < signature.length; i++) {
        if (bytes[i] !== signature[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        return {
          safe: false,
          reason: "File appears to be an executable",
        };
      }
    }
  }

  // Check for script tags in text files
  if (file.type.startsWith("text/") || file.name.endsWith(".html")) {
    const text = new TextDecoder().decode(buffer);
    if (text.includes("<script") || text.includes("javascript:")) {
      return {
        safe: false,
        reason: "File contains potentially malicious scripts",
      };
    }
  }

  return { safe: true };
}

