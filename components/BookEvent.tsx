'use client';

import { createBooking } from '@/lib/actions/booking.actions';
import posthog from 'posthog-js';
import { useState } from 'react';

/**
 * BookEvent Component
 *
 * Allows users to register/book an event by entering their email.
 *
 * Features:
 * - Email input form
 * - Server action for booking creation
 * - PostHog analytics tracking
 * - Success state display
 *
 * @param eventId - MongoDB _id of the event
 * @param slug - URL-friendly slug of the event
 */
const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles form submission for event booking
   *
   * Process:
   * 1. Prevents default form submission
   * 2. Calls server action to create booking
   * 3. Tracks success/failure with PostHog analytics
   * 4. Updates UI state based on result
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setError('');

    const { success } = await createBooking({ eventId, slug, email });

    if (success) {
      setSubmitted(true);
      // Track successful booking in PostHog analytics
      posthog.capture('event_booked', { eventId, slug, email });
    } else {
      console.error('Booking failed');
      // Track booking failure for debugging
      posthog.captureException('Booking failed');
    }
  };

  return (
    <div id="book-event">
      {submitted ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              placeholder="Enter your email address"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="button-submit">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};
export default BookEvent;
