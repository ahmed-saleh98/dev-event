import Link from 'next/link';
import Image from 'next/image';

/**
 * Navbar Component
 *
 * Main navigation bar for the application.
 * Contains logo, home link, events anchor link, and create event link.
 */
const Navbar = () => {
  return (
    <header>
      <nav>
        {/* Logo linking to home page */}
        <Link href="/" className="logo">
          <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
          <p>DevEvent</p>
        </Link>

        {/* Navigation links */}
        <ul>
          <Link href="/">Home</Link>
          <Link href="/#events">Events</Link>
          <Link href="/create-event">Create Event</Link>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
