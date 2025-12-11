'use server';

import { Event } from '@/database';

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    const event = await Event.findOne({ slug });

    return await Event.find({
      slug: { $ne: slug },
      tags: { $in: event?.tags || [] },
    }).lean();
  } catch {
    return [];
  }
};
