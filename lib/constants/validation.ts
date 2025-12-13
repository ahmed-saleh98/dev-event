/**
 * Validation Constants
 *
 * Centralized constants for validation rules across the application.
 * This ensures consistency and makes it easy to update limits.
 */

export const VALIDATION = {
  // File upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const,

  // Event field limits (matching database schema)
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_OVERVIEW_LENGTH: 500,

  // Minimum requirements
  MIN_TAGS_COUNT: 1,
  MIN_AGENDA_ITEMS: 1,
} as const;

/**
 * Type for allowed image MIME types
 */
export type AllowedImageType = (typeof VALIDATION.ALLOWED_IMAGE_TYPES)[number];
