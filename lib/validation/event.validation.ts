/**
 * Event Validation Utilities
 *
 * Centralized validation logic for event forms and data.
 */

import { VALIDATION } from '@/lib/constants/validation';
import { EventFormData, ValidationResult } from '@/lib/types/event';

/**
 * Validates event form data
 *
 * @param data - Event form data to validate
 * @param imageFile - Optional image file to validate
 * @returns Validation result with errors object
 */
export function validateEventForm(
  data: EventFormData,
  imageFile?: File | null
): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length > VALIDATION.MAX_TITLE_LENGTH) {
    errors.title = `Title cannot exceed ${VALIDATION.MAX_TITLE_LENGTH} characters`;
  }

  // Date validation
  if (!data.date) {
    errors.date = 'Event date is required';
  } else {
    // Parse date string (YYYY-MM-DD format from HTML5 date input)
    const dateParts = data.date.split('-');
    if (dateParts.length !== 3) {
      errors.date = 'Invalid date format';
    } else {
      // Create date in local timezone to avoid UTC issues
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(dateParts[2], 10);
      const eventDate = new Date(year, month, day);

      if (isNaN(eventDate.getTime())) {
        errors.date = 'Invalid date format';
      } else {
        // Check if date is in the past (allow same day events)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate < today) {
          errors.date = 'Event date must be today or in the future';
        }
      }
    }
  }

  // Time validation
  if (!data.time) {
    errors.time = 'Event time is required';
  } else {
    // Validate time format (HH:MM) - be more flexible with format
    // HTML5 time input returns HH:MM format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.time)) {
      errors.time = 'Invalid time format. Use HH:MM (24-hour format)';
    } else if (data.date) {
      // Validate that event date/time is in the future
      // Parse date and time together in local timezone
      const dateParts = data.date.split('-');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10);
        const [hours, minutes] = data.time.split(':').map(Number);

        const eventDateTime = new Date(year, month, day, hours, minutes);
        const now = new Date();

        // Allow a small buffer (1 minute) to account for submission time
        const buffer = 60 * 1000; // 1 minute in milliseconds
        if (eventDateTime.getTime() < now.getTime() - buffer) {
          errors.time = 'Event date and time must be in the future';
        }
      }
    }
  }

  // Venue validation
  if (!data.venue?.trim()) {
    errors.venue = 'Event location/venue is required';
  }

  // Location validation
  if (!data.location?.trim()) {
    errors.location = 'Location address is required';
  }

  // Mode validation
  if (!data.mode) {
    errors.mode = 'Event type is required';
  } else if (!['online', 'offline', 'hybrid'].includes(data.mode)) {
    errors.mode = 'Event type must be online, offline, or hybrid';
  }

  // Description validation
  if (!data.description?.trim()) {
    errors.description = 'Event description is required';
  } else if (data.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description cannot exceed ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`;
  }

  // Overview validation (optional but has max length if provided)
  if (data.overview && data.overview.length > VALIDATION.MAX_OVERVIEW_LENGTH) {
    errors.overview = `Overview cannot exceed ${VALIDATION.MAX_OVERVIEW_LENGTH} characters`;
  }

  // Tags validation
  if (!data.tags?.trim()) {
    errors.tags = 'At least one tag is required';
  } else {
    const tagsArray = data.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (tagsArray.length < VALIDATION.MIN_TAGS_COUNT) {
      errors.tags = `Please add at least ${VALIDATION.MIN_TAGS_COUNT} tag`;
    }
  }

  // Image file validation
  if (!imageFile) {
    errors.image = 'Event image is required';
  } else {
    const imageErrors = validateImageFile(imageFile);
    if (imageErrors) {
      errors.image = imageErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates an image file
 *
 * @param file - File to validate
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(file: File): string | null {
  // Check file size
  if (file.size > VALIDATION.MAX_FILE_SIZE) {
    const maxSizeMB = VALIDATION.MAX_FILE_SIZE / (1024 * 1024);
    return `Image file size must be less than ${maxSizeMB}MB`;
  }

  // Check MIME type
  if (
    !VALIDATION.ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof VALIDATION.ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return `Only ${VALIDATION.ALLOWED_IMAGE_TYPES.join(
      ', '
    )} images are allowed`;
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = VALIDATION.ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return `File must have one of these extensions: ${VALIDATION.ALLOWED_IMAGE_EXTENSIONS.join(
      ', '
    )}`;
  }

  return null;
}

/**
 * Validates that a date string is in the future
 */
export function isFutureDate(dateString: string, timeString?: string): boolean {
  if (!dateString) return false;

  const dateTime = timeString ? `${dateString}T${timeString}` : dateString;
  const eventDate = new Date(dateTime);

  return eventDate > new Date();
}
