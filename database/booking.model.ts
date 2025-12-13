import { Schema, model, models, Document, Types } from 'mongoose';
import Event from './event.model';

/**
 * TypeScript interface for Booking document
 * 
 * Represents an event registration/booking by a user.
 * Each booking links a user's email to a specific event.
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking Schema Definition
 * 
 * Mongoose schema for Booking documents with validation and indexes.
 * Enforces one booking per email per event (unique constraint).
 * Includes pre-save hook to validate event exists.
 */
const BookingSchema = new Schema<IBooking>(
  {
    // Reference to Event document - required
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    // User email - required, validated, stored in lowercase
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          // RFC 5322 compliant email validation regex
          const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          return emailRegex.test(email);
        },
        message: 'Please provide a valid email address',
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
 * Validates that the referenced event exists before creating a booking.
 * Prevents orphaned bookings and ensures data integrity.
 */
BookingSchema.pre('save', async function () {
  const booking = this as IBooking;

  // Only validate eventId if it's new or modified
  if (booking.isModified('eventId') || booking.isNew) {
    try {
      const eventExists = await Event.findById(booking.eventId).select('_id');

      if (!eventExists) {
        const error = new Error(
          `Event with ID ${booking.eventId} does not exist`
        );
        error.name = 'ValidationError';
        throw error;
      }
    } catch {
      const validationError = new Error(
        'Invalid events ID format or database error'
      );
      validationError.name = 'ValidationError';
      throw validationError;
    }
  }
});

// Create index on eventId for faster queries when fetching bookings by event
BookingSchema.index({ eventId: 1 });

// Create compound index for common queries (e.g., get bookings for an event sorted by date)
// Improves performance when querying bookings by event and date
BookingSchema.index({ eventId: 1, createdAt: -1 });

// Create index on email for user booking lookups
// Allows efficient queries to find all bookings by a specific user
BookingSchema.index({ email: 1 });

// Enforce unique constraint: one booking per event per email
// Prevents duplicate bookings from the same user for the same event
BookingSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, name: 'uniq_event_email' }
);
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
