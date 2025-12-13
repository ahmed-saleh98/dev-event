import { Schema, model, models, Document } from 'mongoose';

/**
 * TypeScript interface for Event document
 *
 * Defines the structure of an Event document in MongoDB.
 * All fields are required except those with default values.
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event Schema Definition
 *
 * Mongoose schema for Event documents with validation rules and indexes.
 * Includes pre-save hooks for automatic slug generation and data normalization.
 */
const EventSchema = new Schema<IEvent>(
  {
    // Event title - required, max 100 characters
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    // URL-friendly slug - auto-generated from title, must be unique
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Full event description - required, max 1000 characters
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    // Brief overview - required, max 500 characters
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      maxlength: [500, 'Overview cannot exceed 500 characters'],
    },
    // Cloudinary image URL - required
    image: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true,
    },
    // Venue name or online link - required
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    // Full location address - required
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    // Event date in ISO format (YYYY-MM-DD) - auto-normalized
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    // Event time in 24-hour format (HH:MM) - auto-normalized
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    // Event mode - must be one of: online, offline, hybrid
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be either online, offline, or hybrid',
      },
    },
    // Target audience description - required
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    // Array of agenda items - must have at least one item
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one agenda item is required',
      },
    },
    // Event organizer name - required
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    // Array of tags for categorization - must have at least one tag
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one tag is required',
      },
    },
  },
  {
    // Enable automatic createdAt and updatedAt timestamps
    timestamps: true,
  }
);

/**
 * Pre-save Hook
 *
 * Automatically runs before saving an event document.
 * Handles:
 * - Slug generation from title (if title changed or document is new)
 * - Date normalization to ISO format (YYYY-MM-DD)
 * - Time normalization to 24-hour format (HH:MM)
 */
EventSchema.pre('save', async function () {
  const event = this as IEvent;

  // Generate slug only if title changed or document is new
  // This ensures slugs are always up-to-date with titles
  if (event.isModified('title') || event.isNew) {
    let slug = generateSlug(event.title);

    // Handle duplicate slugs by appending a counter
    // This prevents slug collisions when multiple events have similar titles
    let counter = 1;
    const existingEvent = await Event.findOne({
      slug,
      _id: { $ne: event._id },
    });

    while (existingEvent) {
      slug = `${generateSlug(event.title)}-${counter}`;
      const checkEvent = await Event.findOne({ slug, _id: { $ne: event._id } });
      if (!checkEvent) break;
      counter++;
    }

    event.slug = slug;
  }

  // Normalize date to ISO format if it's not already
  // Ensures consistent date format in database
  if (event.isModified('date')) {
    event.date = normalizeDate(event.date);
  }

  // Normalize time format to 24-hour (HH:MM)
  // Converts 12-hour format to 24-hour if needed
  if (event.isModified('time')) {
    event.time = normalizeTime(event.time);
  }
});

/**
 * Generates a URL-friendly slug from a title
 *
 * Process:
 * 1. Convert to lowercase
 * 2. Remove special characters
 * 3. Replace spaces with hyphens
 * 4. Remove duplicate hyphens
 * 5. Remove leading/trailing hyphens
 *
 * Example: "React Summit 2025!" -> "react-summit-2025"
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalizes a date string to ISO format (YYYY-MM-DD)
 *
 * @throws Error if date format is invalid
 */
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

/**
 * Normalizes a time string to 24-hour format (HH:MM)
 *
 * Supports:
 * - 24-hour format: "14:30"
 * - 12-hour format: "2:30 PM" or "02:30 PM"
 *
 * @throws Error if time format or values are invalid
 */
function normalizeTime(timeString: string): string {
  // Handle various time formats and convert to HH:MM (24-hour format)
  const timeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
  const match = timeString.trim().match(timeRegex);

  if (!match) {
    throw new Error('Invalid time format. Use HH:MM or HH:MM AM/PM');
  }

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[4]?.toUpperCase();

  // Convert 12-hour to 24-hour format if period is provided
  if (period) {
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }

  // Validate time values
  if (
    hours < 0 ||
    hours > 23 ||
    parseInt(minutes) < 0 ||
    parseInt(minutes) > 59
  ) {
    throw new Error('Invalid time values');
  }

  // Return formatted time with leading zeros
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// Create compound index for common queries (e.g., find events by date and mode)
// Improves query performance for filtering events
EventSchema.index({ date: 1, mode: 1 });

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
