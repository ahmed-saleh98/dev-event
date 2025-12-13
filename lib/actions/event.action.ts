'use server';

import { Event } from '@/database';

/**
 * getSimilarEventsBySlug
 * 
 * Server action to find events similar to a given event based on shared tags.
 * 
 * @param slug - The slug of the event to find similar events for
 * @returns Array of similar events (excluding the current event)
 * 
 * Logic:
 * 1. Find the event by slug
 * 2. Find other events that share at least one tag with the current event
 * 3. Exclude the current event from results
 * 4. Returns empty array on error
 */
export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    // Find the current event to get its tags
    const event = await Event.findOne({ slug });

    // Find events with matching tags, excluding the current event
    // $ne = not equal, $in = matches any value in array
    return await Event.find({
      slug: { $ne: slug },
      tags: { $in: event?.tags || [] },
    }).lean();
  } catch {
    // Return empty array on error to prevent UI crashes
    return [];
  }
};
