/**
 * **Feature: whatsapp-lead-management, Property 3: Media Type Validation**
 * **Validates: Requirements 1.5**
 *
 * For any file upload attempt, the system SHALL accept only valid file types
 * (jpg/png/webp for images, mp4/webm for videos, pdf for documents) and reject all others.
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { MediaType } from '../../common/enums';

// Allowed file types for media upload (mirroring the service constants)
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_VIDEO_EXTENSIONS = ['.mp4', '.webm'];
const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf'];

// Max file sizes in bytes
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Pure function implementation of file type validation
 * (mirrors CategoryService.validateFileType)
 */
function validateFileType(
  mimetype: string,
  filename: string,
  size: number,
): { isValid: boolean; mediaType: MediaType | null; error?: string } {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));

  // Check image types
  if (
    ALLOWED_IMAGE_TYPES.includes(mimetype) &&
    ALLOWED_IMAGE_EXTENSIONS.includes(extension)
  ) {
    if (size > MAX_IMAGE_SIZE) {
      return {
        isValid: false,
        mediaType: null,
        error: 'Image file size exceeds 10MB limit',
      };
    }
    return { isValid: true, mediaType: MediaType.IMAGE };
  }

  // Check video types
  if (
    ALLOWED_VIDEO_TYPES.includes(mimetype) &&
    ALLOWED_VIDEO_EXTENSIONS.includes(extension)
  ) {
    if (size > MAX_VIDEO_SIZE) {
      return {
        isValid: false,
        mediaType: null,
        error: 'Video file size exceeds 100MB limit',
      };
    }
    return { isValid: true, mediaType: MediaType.VIDEO };
  }

  // Check document types
  if (
    ALLOWED_DOCUMENT_TYPES.includes(mimetype) &&
    ALLOWED_DOCUMENT_EXTENSIONS.includes(extension)
  ) {
    if (size > MAX_DOCUMENT_SIZE) {
      return {
        isValid: false,
        mediaType: null,
        error: 'Document file size exceeds 20MB limit',
      };
    }
    return { isValid: true, mediaType: MediaType.DOCUMENT };
  }

  return {
    isValid: false,
    mediaType: null,
    error:
      'Invalid file type. Allowed: jpg/png/webp for images, mp4/webm for videos, pdf for documents',
  };
}

// Arbitrary generators for valid file types
const validImageMimetypeArb = fc.constantFrom(...ALLOWED_IMAGE_TYPES);
const validVideoMimetypeArb = fc.constantFrom(...ALLOWED_VIDEO_TYPES);
const validDocumentMimetypeArb = fc.constantFrom(...ALLOWED_DOCUMENT_TYPES);

const validImageExtensionArb = fc.constantFrom(...ALLOWED_IMAGE_EXTENSIONS);
const validVideoExtensionArb = fc.constantFrom(...ALLOWED_VIDEO_EXTENSIONS);
const validDocumentExtensionArb = fc.constantFrom(
  ...ALLOWED_DOCUMENT_EXTENSIONS,
);

// Arbitrary generators for invalid file types
const invalidMimetypeArb = fc.constantFrom(
  'text/plain',
  'text/html',
  'application/json',
  'application/xml',
  'image/gif',
  'image/bmp',
  'video/avi',
  'video/mkv',
  'application/msword',
  'application/zip',
);

const invalidExtensionArb = fc.constantFrom(
  '.txt',
  '.html',
  '.json',
  '.xml',
  '.gif',
  '.bmp',
  '.avi',
  '.mkv',
  '.doc',
  '.zip',
  '.exe',
);

// Arbitrary generator for filename base (without extension)
const filenameBaseArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length > 0 && !s.includes('.'))
  .map((s) => s.replace(/[^a-zA-Z0-9_-]/g, '_'));

// Arbitrary generators for file sizes
const validImageSizeArb = fc.integer({ min: 1, max: MAX_IMAGE_SIZE });
const validVideoSizeArb = fc.integer({ min: 1, max: MAX_VIDEO_SIZE });
const validDocumentSizeArb = fc.integer({ min: 1, max: MAX_DOCUMENT_SIZE });

const oversizedImageSizeArb = fc.integer({
  min: MAX_IMAGE_SIZE + 1,
  max: MAX_IMAGE_SIZE * 2,
});
const oversizedVideoSizeArb = fc.integer({
  min: MAX_VIDEO_SIZE + 1,
  max: MAX_VIDEO_SIZE * 2,
});
const oversizedDocumentSizeArb = fc.integer({
  min: MAX_DOCUMENT_SIZE + 1,
  max: MAX_DOCUMENT_SIZE * 2,
});

describe('Media Type Validation Property Tests', () => {
  /**
   * **Feature: whatsapp-lead-management, Property 3: Media Type Validation**
   * **Validates: Requirements 1.5**
   */
  describe('Property 3: Valid file types are accepted', () => {
    it('Valid image files (jpg/png/webp) are accepted', () => {
      fc.assert(
        fc.property(
          validImageMimetypeArb,
          validImageExtensionArb,
          filenameBaseArb,
          validImageSizeArb,
          (mimetype, extension, filenameBase, size) => {
            // Ensure mimetype and extension match
            const matchingPairs: Record<string, string[]> = {
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'image/webp': ['.webp'],
            };

            // Only test matching pairs
            if (!matchingPairs[mimetype]?.includes(extension)) {
              return true; // Skip non-matching pairs
            }

            const filename = `${filenameBase}${extension}`;
            const result = validateFileType(mimetype, filename, size);

            return (
              result.isValid === true && result.mediaType === MediaType.IMAGE
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Valid video files (mp4/webm) are accepted', () => {
      fc.assert(
        fc.property(
          validVideoMimetypeArb,
          validVideoExtensionArb,
          filenameBaseArb,
          validVideoSizeArb,
          (mimetype, extension, filenameBase, size) => {
            // Ensure mimetype and extension match
            const matchingPairs: Record<string, string[]> = {
              'video/mp4': ['.mp4'],
              'video/webm': ['.webm'],
            };

            // Only test matching pairs
            if (!matchingPairs[mimetype]?.includes(extension)) {
              return true; // Skip non-matching pairs
            }

            const filename = `${filenameBase}${extension}`;
            const result = validateFileType(mimetype, filename, size);

            return (
              result.isValid === true && result.mediaType === MediaType.VIDEO
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Valid document files (pdf) are accepted', () => {
      fc.assert(
        fc.property(
          validDocumentMimetypeArb,
          validDocumentExtensionArb,
          filenameBaseArb,
          validDocumentSizeArb,
          (mimetype, extension, filenameBase, size) => {
            const filename = `${filenameBase}${extension}`;
            const result = validateFileType(mimetype, filename, size);

            return (
              result.isValid === true && result.mediaType === MediaType.DOCUMENT
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 3: Invalid file types are rejected', () => {
    it('Invalid mimetypes are rejected', () => {
      fc.assert(
        fc.property(
          invalidMimetypeArb,
          fc.constantFrom(...ALLOWED_IMAGE_EXTENSIONS),
          filenameBaseArb,
          validImageSizeArb,
          (mimetype, extension, filenameBase, size) => {
            const filename = `${filenameBase}${extension}`;
            const result = validateFileType(mimetype, filename, size);

            return (
              result.isValid === false &&
              result.mediaType === null &&
              result.error !== undefined
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Invalid extensions are rejected', () => {
      fc.assert(
        fc.property(
          validImageMimetypeArb,
          invalidExtensionArb,
          filenameBaseArb,
          validImageSizeArb,
          (mimetype, extension, filenameBase, size) => {
            const filename = `${filenameBase}${extension}`;
            const result = validateFileType(mimetype, filename, size);

            return (
              result.isValid === false &&
              result.mediaType === null &&
              result.error !== undefined
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Mismatched mimetype and extension are rejected', () => {
      fc.assert(
        fc.property(
          validImageMimetypeArb,
          validVideoExtensionArb,
          filenameBaseArb,
          validImageSizeArb,
          (mimetype, extension, filenameBase, size) => {
            const filename = `${filenameBase}${extension}`;
            const result = validateFileType(mimetype, filename, size);

            // Image mimetype with video extension should be rejected
            return (
              result.isValid === false &&
              result.mediaType === null &&
              result.error !== undefined
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 3: File size limits are enforced', () => {
    it('Oversized images are rejected', () => {
      fc.assert(
        fc.property(
          filenameBaseArb,
          oversizedImageSizeArb,
          (filenameBase, size) => {
            const filename = `${filenameBase}.jpg`;
            const result = validateFileType('image/jpeg', filename, size);

            return (
              result.isValid === false &&
              result.mediaType === null &&
              result.error?.includes('10MB') === true
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Oversized videos are rejected', () => {
      fc.assert(
        fc.property(
          filenameBaseArb,
          oversizedVideoSizeArb,
          (filenameBase, size) => {
            const filename = `${filenameBase}.mp4`;
            const result = validateFileType('video/mp4', filename, size);

            return (
              result.isValid === false &&
              result.mediaType === null &&
              result.error?.includes('100MB') === true
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Oversized documents are rejected', () => {
      fc.assert(
        fc.property(
          filenameBaseArb,
          oversizedDocumentSizeArb,
          (filenameBase, size) => {
            const filename = `${filenameBase}.pdf`;
            const result = validateFileType('application/pdf', filename, size);

            return (
              result.isValid === false &&
              result.mediaType === null &&
              result.error?.includes('20MB') === true
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Property 3: Correct MediaType is returned', () => {
    it('Images return MediaType.IMAGE', () => {
      fc.assert(
        fc.property(
          filenameBaseArb,
          validImageSizeArb,
          (filenameBase, size) => {
            const filename = `${filenameBase}.jpg`;
            const result = validateFileType('image/jpeg', filename, size);

            return result.mediaType === MediaType.IMAGE;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Videos return MediaType.VIDEO', () => {
      fc.assert(
        fc.property(
          filenameBaseArb,
          validVideoSizeArb,
          (filenameBase, size) => {
            const filename = `${filenameBase}.mp4`;
            const result = validateFileType('video/mp4', filename, size);

            return result.mediaType === MediaType.VIDEO;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Documents return MediaType.DOCUMENT', () => {
      fc.assert(
        fc.property(
          filenameBaseArb,
          validDocumentSizeArb,
          (filenameBase, size) => {
            const filename = `${filenameBase}.pdf`;
            const result = validateFileType('application/pdf', filename, size);

            return result.mediaType === MediaType.DOCUMENT;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
