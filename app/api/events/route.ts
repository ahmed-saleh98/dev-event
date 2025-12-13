import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

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
    if (!file || !(file instanceof File))
      return NextResponse.json(
        { message: 'Image file is required' },
        { status: 400 }
      );

    // Extract all form fields except image, tags, and agenda
    // These will be handled separately due to their special formats
    const event: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'image' && key !== 'tags' && key !== 'agenda') {
        event[key] = value as string;
      }
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
    // Log error for debugging and return user-friendly error message
    console.error(e);
    return NextResponse.json(
      {
        message: 'Event Creation Failed',
        error: e instanceof Error ? e.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events
 * Fetches all events from the database, sorted by creation date (newest first)
 *
 * Returns: Array of event objects
 */
export async function GET() {
  try {
    // Connect to MongoDB database
    await connectDB();

    // Fetch all events, sorted by creation date (newest first)
    const events = await Event.find().sort({ createdAt: -1 });

    return NextResponse.json(
      { message: 'Events fetched successfully', events },
      { status: 200 }
    );
  } catch (e) {
    // Return error if database query fails
    return NextResponse.json(
      { message: 'Event fetching failed', error: e },
      { status: 500 }
    );
  }
}
