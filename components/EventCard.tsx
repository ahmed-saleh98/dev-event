import Link from 'next/link';
import Image from 'next/image';

/**
 * Props interface for EventCard component
 */
interface Props {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

/**
 * EventCard Component
 * 
 * Displays a card preview of an event with:
 * - Event image/banner
 * - Location with icon
 * - Event title
 * - Date and time with icons
 * 
 * The entire card is clickable and links to the event detail page.
 * 
 * @param title - Event title
 * @param image - URL of event image/banner
 * @param slug - URL-friendly identifier for routing
 * @param location - Event location/venue
 * @param date - Event date
 * @param time - Event time
 */
const EventCard = ({ title, image, slug, location, date, time }: Props) => {
  return (
    <Link href={`/events/${slug}`} id="event-card">
      {/* Event banner image */}
      <Image
        src={image}
        alt={title}
        width={410}
        height={300}
        className="poster"
      />

      {/* Location display with icon */}
      <div className="flex flex-row gap-2">
        <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
        <p>{location}</p>
      </div>

      {/* Event title */}
      <p className="title">{title}</p>

      {/* Date and time display with icons */}
      <div className="datetime">
        <div>
          <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
          <p>{date}</p>
        </div>
        <div>
          <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
          <p>{time}</p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
