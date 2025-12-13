'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const CreateEventPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
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
    tags: '',
    agenda: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.date || !formData.time || !formData.venue || 
          !formData.location || !formData.mode || !formData.description || !imageFile) {
        throw new Error('Please fill in all required fields');
      }

      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      if (tagsArray.length === 0) {
        throw new Error('Please add at least one tag');
      }

      // Parse agenda from newline-separated string or use description as default
      const agendaArray = formData.agenda
        ? formData.agenda
            .split('\n')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        : [formData.description]; // Use description as default agenda if not provided

      // Create FormData
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('date', formData.date);
      submitData.append('time', formData.time);
      submitData.append('venue', formData.venue);
      submitData.append('location', formData.location);
      submitData.append('mode', formData.mode);
      submitData.append('description', formData.description);
      submitData.append('overview', formData.overview || formData.description);
      submitData.append('organizer', formData.organizer || 'DevEvent');
      submitData.append('audience', formData.audience || 'Developers');
      submitData.append('tags', JSON.stringify(tagsArray));
      submitData.append('agenda', JSON.stringify(agendaArray));
      submitData.append('image', imageFile);

      // Submit to API
      const response = await fetch('/api/events', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }

      setSuccess(true);
      // Redirect to events page after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Created Successfully!</h1>
          <p className="text-light-100">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-center text-4xl font-bold mb-12">Create an Event</h1>

        <form onSubmit={handleSubmit} className="bg-dark-100 border border-dark-200 rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-4">
              {error}
            </div>
          )}

          {/* Event Title */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-light-100 text-sm font-medium">
              Event Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              required
              className="bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 placeholder:text-light-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Event Date */}
          <div className="flex flex-col gap-2">
            <label htmlFor="date" className="text-light-100 text-sm font-medium">
              Event Date
            </label>
            <div className="relative">
              <Image
                src="/icons/calendar.svg"
                alt="calendar"
                width={20}
                height={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="bg-dark-200 rounded-lg px-5 py-2.5 pl-12 text-light-100 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Event Time */}
          <div className="flex flex-col gap-2">
            <label htmlFor="time" className="text-light-100 text-sm font-medium">
              Event Time
            </label>
            <div className="relative">
              <Image
                src="/icons/clock.svg"
                alt="clock"
                width={20}
                height={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className="bg-dark-200 rounded-lg px-5 py-2.5 pl-12 text-light-100 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Event Location/Venue */}
          <div className="flex flex-col gap-2">
            <label htmlFor="venue" className="text-light-100 text-sm font-medium">
              Event Location
            </label>
            <div className="relative">
              <Image
                src="/icons/pin.svg"
                alt="location"
                width={20}
                height={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="Enter venue or online link"
                required
                className="bg-dark-200 rounded-lg px-5 py-2.5 pl-12 text-light-100 placeholder:text-light-200 w-full focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Location (for address) */}
          <div className="flex flex-col gap-2">
            <label htmlFor="location" className="text-light-100 text-sm font-medium">
              Location Address
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter full address (e.g., City, Country)"
              required
              className="bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 placeholder:text-light-200 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Event Type (Mode) */}
          <div className="flex flex-col gap-2">
            <label htmlFor="mode" className="text-light-100 text-sm font-medium">
              Event Type
            </label>
            <div className="relative">
              <Image
                src="/icons/mode.svg"
                alt="mode"
                width={20}
                height={20}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
              />
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleInputChange}
                required
                className="bg-dark-200 rounded-lg px-5 py-2.5 pl-12 text-light-100 w-full appearance-none focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">Select event type</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <Image
                src="/icons/arrow-down.svg"
                alt="dropdown"
                width={16}
                height={16}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>

          {/* Event Image/Banner */}
          <div className="flex flex-col gap-2">
            <label htmlFor="image" className="text-light-100 text-sm font-medium">
              Event Image / Banner
            </label>
            <div className="relative">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="hidden"
              />
              <label
                htmlFor="image"
                className="bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 w-full flex items-center gap-3 cursor-pointer hover:bg-dark-200/80 transition-colors border border-transparent hover:border-primary/20"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-light-200"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-light-200">
                  {imageFile ? imageFile.name : 'Upload event image or banner'}
                </span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label htmlFor="tags" className="text-light-100 text-sm font-medium">
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Add tags such as react, next, js"
              required
              className="bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 placeholder:text-light-200 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-light-200 text-xs">Separate tags with commas</p>
          </div>

          {/* Event Description */}
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-light-100 text-sm font-medium">
              Event Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Briefly describe the event"
              required
              rows={4}
              className="bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 placeholder:text-light-200 w-full focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Additional fields (hidden but can be shown if needed) */}
          <div className="flex flex-col gap-2">
            <label htmlFor="overview" className="text-light-100 text-sm font-medium">
              Overview (Optional)
            </label>
            <textarea
              id="overview"
              name="overview"
              value={formData.overview}
              onChange={handleInputChange}
              placeholder="Brief overview of the event"
              rows={3}
              className="bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 placeholder:text-light-200 w-full focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="organizer" className="text-light-100 text-sm font-medium">
              Organizer (Optional)
            </label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              placeholder="Event organizer name"
              className="bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 placeholder:text-light-200 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="audience" className="text-light-100 text-sm font-medium">
              Target Audience (Optional)
            </label>
            <input
              type="text"
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleInputChange}
              placeholder="e.g., Developers, Designers, etc."
              className="bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 placeholder:text-light-200 w-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="agenda" className="text-light-100 text-sm font-medium">
              Agenda (Optional)
            </label>
            <textarea
              id="agenda"
              name="agenda"
              value={formData.agenda}
              onChange={handleInputChange}
              placeholder="Enter agenda items, one per line"
              rows={4}
              className="bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 placeholder:text-light-200 w-full focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <p className="text-light-200 text-xs">Enter one agenda item per line</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 w-full cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 text-lg font-semibold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving Event...' : 'Save Event'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CreateEventPage;

