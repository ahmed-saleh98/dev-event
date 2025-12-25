import EventCard from '@/components/EventCard';
import ExploreBtn from '@/components/ExploreBtn';
import { IEvent } from '@/database';
import { cacheLife } from 'next/cache';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * Home Page Component
 *
 * Displays the main landing page with featured events.
 *
 * Caching:
 * - Uses Next.js cache with 1-hour lifetime
 * - Cache is invalidated when new events are created (via revalidatePath in API)
 * - This improves performance by reducing database queries
 */
const page = async () => {
  'use cache';
  cacheLife('hours');

  // Fetch events from API (cached for 1 hour)
  // Note: API now supports pagination, but home page fetches all events
  const response = await fetch(`${BASE_URL}/api/events?limit=100`);
  const data = await response.json();
  const events = data.data || data.events || []; // Support both new and old response formats
  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h2>Featured Events</h2>
        <ul className="events">
          {events &&
            events.length > 0 &&
            events.map((event: IEvent) => (
              <li key={event.slug}>
                <EventCard {...event} loading="eager" />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
