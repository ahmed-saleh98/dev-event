/**
 * Event-related TypeScript types
 */

/**
 * Event form data structure
 */
export interface EventFormData {
  title: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  mode: 'online' | 'offline' | 'hybrid';
  description: string;
  overview?: string;
  organizer?: string;
  audience?: string;
  tags: string;
  agenda?: string;
}

/**
 * Validation errors structure
 */
export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}
