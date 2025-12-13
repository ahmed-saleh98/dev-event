# Dev Event

A modern platform for discovering and managing developer events including hackathons, meetups, and conferences. Built with Next.js, TypeScript, and MongoDB.

## Features

- **Event Discovery**: Browse featured developer events
- **Event Creation**: Create and manage events with image uploads
- **Event Booking**: Book tickets for events
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Image Management**: Cloudinary integration for event images
- **Analytics**: PostHog integration for user tracking

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide React icons
- **Database**: MongoDB with Mongoose
- **Image Storage**: Cloudinary
- **Analytics**: PostHog
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Cloudinary account (for image uploads)
- PostHog account (optional, for analytics)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/ahmed-saleh98/dev-event.git
cd dev-event
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key (optional)
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host (optional)
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## API Endpoints

### Events

- `GET /api/events` - Fetch all events (with pagination support)
- `POST /api/events` - Create a new event (requires form data with image)
- `GET /api/events/[slug]` - Fetch a specific event by slug

### Bookings

- Additional booking endpoints available through the booking actions

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── create-event/      # Event creation page
│   └── events/            # Event detail pages
├── components/            # Reusable React components
├── database/              # MongoDB models and connection
├── lib/                   # Utility functions and configurations
│   ├── actions/           # Server actions
│   ├── constants/         # App constants
│   ├── types/             # TypeScript type definitions
│   └── validation/        # Validation schemas
└── public/                # Static assets
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Deployment

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Make sure to set up your environment variables in Vercel and connect your MongoDB and Cloudinary accounts.
