import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';
import { validateImageFile } from '@/lib/validation/event.validation';
import { ApiResponse } from '@/lib/types/api';

/**
 * POST /api/events
 * Creates a new event with image upload to Cloudinary
 *
 * Expected FormData fields:
 * - title, date, time, venue, location, mode, description, overview, organizer, audience (strings)
 * - tags: JSON string array (e.g., ["react", "next", "js"])
 * - agenda: JSON string array (optional, falls back to description if not provided)
 * - image: File object (required)
 */
export async function POST(req: NextRequest) {
  try {
    // Connect to MongoDB database
    await connectDB();

    // Parse multipart form data (includes file upload)
    const formData = await req.formData();

    // Extract and validate image file
    const file = formData.get('image') as File;
    if (!file || !(file instanceof File)) {
      return NextResponse.json<ApiResponse>(
        { message: 'Image file is required' },
        { status: 400 }
      );
    }

    // Validate file size, type, and extension
    const fileValidationError = validateImageFile(file);
    if (fileValidationError) {
      return NextResponse.json<ApiResponse>(
        { message: fileValidationError },
        { status: 400 }
      );
    }

    // Extract all form fields except image, tags, and agenda
    // These will be handled separately due to their special formats
    // Using proper typing instead of Record<string, string>
    const event: {
      title: string;
      date: string;
      time: string;
      venue: string;
      location: string;
      mode: string;
      description: string;
      overview: string;
      organizer: string;
      audience: string;
      image?: string;
    } = {
      title: '',
      date: '',
      time: '',
      venue: '',
      location: '',
      mode: '',
      description: '',
      overview: '',
      organizer: '',
      audience: '',
    };

    // Extract form fields
    for (const [key, value] of formData.entries()) {
      if (key !== 'image' && key !== 'tags' && key !== 'agenda') {
        const stringValue = value as string;
        if (key in event) {
          (event as Record<string, string>)[key] = stringValue;
        }
      }
    }

    // Set defaults for required fields that might be empty
    // These fields are required by the database schema but optional in the form
    if (!event.overview || event.overview.trim() === '') {
      event.overview = event.description || 'Event overview';
    }
    if (!event.organizer || event.organizer.trim() === '') {
      event.organizer = 'DevEvent';
    }
    if (!event.audience || event.audience.trim() === '') {
      event.audience = 'Developers';
    }

    // Extract tags, agenda, and description for special processing
    const tagsString = formData.get('tags') as string;
    const agendaString = formData.get('agenda') as string;
    const description = formData.get('description') as string;

    // Validate that tags are provided (required field)
    if (!tagsString) {
      return NextResponse.json(
        { message: 'Tags are required' },
        { status: 400 }
      );
    }

    let tags: string[];
    let agenda: string[];

    // Parse JSON strings into arrays
    try {
      tags = JSON.parse(tagsString);

      // Parse agenda or use description as fallback (matching frontend logic)
      // Frontend sends description as default agenda when agenda field is empty
      if (agendaString) {
        agenda = JSON.parse(agendaString);
      } else {
        // Use description as default agenda if not provided (matching frontend)
        agenda = description ? [description] : [];
      }
    } catch {
      return NextResponse.json(
        { message: 'Invalid tags or agenda format' },
        { status: 400 }
      );
    }

    // Validate that agenda has at least one item (required by database schema)
    // Database model enforces: agenda array must have length > 0
    if (agenda.length === 0) {
      return NextResponse.json(
        {
          message:
            'At least one agenda item is required. Please provide an agenda or ensure description is filled.',
        },
        { status: 400 }
      );
    }

    // Convert uploaded file to buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload image to Cloudinary
    // Returns a promise that resolves with upload result containing secure_url
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', folder: 'DevEvent' },
          (error, results) => {
            if (error) return reject(error);
            resolve(results);
          }
        )
        .end(buffer);
    });

    // Add Cloudinary image URL to event data
    event.image = (uploadResult as { secure_url: string }).secure_url;

    // Ensure required fields have values (database schema requires these)
    // Set defaults if they're empty or undefined
    if (!event.overview || event.overview.trim() === '') {
      event.overview = event.description || 'Event overview';
    }
    if (!event.organizer || event.organizer.trim() === '') {
      event.organizer = 'DevEvent';
    }
    if (!event.audience || event.audience.trim() === '') {
      event.audience = 'Developers';
    }

    // Create event in database with all fields
    const createdEvent = await Event.create({
      ...event,
      tags: tags,
      agenda: agenda,
    });

    // Revalidate the home page cache to show the new event immediately
    // Without this, new events would only appear after the 1-hour cache expires
    revalidatePath('/');

    return NextResponse.json(
      { message: 'Event created successfully', event: createdEvent },
      { status: 201 }
    );
  } catch (e) {
    // Log error for debugging
    console.error('Event creation error:', e);

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage =
      isDevelopment && e instanceof Error
        ? e.message
        : 'An unexpected error occurred while creating the event';

    return NextResponse.json<ApiResponse>(
      {
        message: 'Event Creation Failed',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events
 * Fetches events from the database with optional pagination
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 *
 * Returns: Paginated array of event objects
 */
export async function GET(req: NextRequest) {
  try {
    // Connect to MongoDB database
    await connectDB();

    // Parse pagination parameters from query string
    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '10', 10))
    );
    const skip = (page - 1) * limit;

    // Fetch events with pagination, sorted by creation date (newest first)
    // Only select fields needed for listing to improve performance
    const events = await Event.find()
      .select('title slug image location date time mode tags')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination metadata
    const total = await Event.countDocuments();

    // Return response with events array for backward compatibility
    // Also include pagination metadata if pagination is used
    const response: ApiResponse & { events?: unknown[]; pagination?: unknown } =
      {
        message: 'Events fetched successfully',
        events, // Keep for backward compatibility
        data: events, // New format
      };

    // Only include pagination if limit is less than total (pagination is active)
    if (limit < total) {
      response.pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };
    }

    return NextResponse.json(response, { status: 200 });
  } catch (e) {
    // Log error for debugging
    console.error('Event fetching error:', e);

    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage =
      isDevelopment && e instanceof Error
        ? e.message
        : 'An unexpected error occurred while fetching events';

    return NextResponse.json<ApiResponse>(
      {
        message: 'Event fetching failed',
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
