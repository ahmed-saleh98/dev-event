'use server';

import { Booking } from '@/database';
import connectDB from '../mongodb';

/**
 * createBooking
 * 
 * Server action to create a new event booking/registration.
 * 
 * @param eventId - The MongoDB _id of the event being booked
 * @param slug - The URL-friendly slug of the event
 * @param email - The email address of the person booking the event
 * @returns Object with success boolean indicating if booking was created
 * 
 * This is a server action (marked with 'use server') that can be called
 * directly from client components without exposing API routes.
 */
export const createBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: string;
  slug: string;
  email: string;
}) => {
  try {
    // Connect to MongoDB database
    await connectDB();
    
    // Create new booking record
    await Booking.create({ eventId, slug, email });
    
    return { success: true };
  } catch (error) {
    // Log error for debugging but don't expose details to client
    console.error('Error creating booking:', error);
    return { success: false };
  }
};
