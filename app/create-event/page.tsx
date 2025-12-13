'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateEventForm } from '@/lib/validation/event.validation';
import { EventFormData, ValidationErrors } from '@/lib/types/event';
import { VALIDATION } from '@/lib/constants/validation';
import {
  FormField,
  FormFieldWithIcon,
  FormTextarea,
  FormSelect,
  FormFileUpload,
} from '@/components/forms';

/**
 * CreateEventPage Component
 *
 * A client-side form component for creating new events.
 * Handles form state, validation, file uploads, and submission to the API.
 * Redirects to home page on successful event creation.
 */
const CreateEventPage = () => {
  const router = useRouter();

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});

  // Form data state - stores all input field values
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    time: '',
    venue: '',
    location: '',
    mode: 'offline',
    description: '',
    overview: '',
    organizer: '',
    audience: '',
    tags: '',
    agenda: '',
  });

  // Store the selected image file for upload
  const [imageFile, setImageFile] = useState<File | null>(null);

  /**
   * Handles changes to text inputs, textareas, and select dropdowns
   * Updates the corresponding field in formData state
   */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles file input changes for event image/banner upload
   * Stores the selected file in state for later submission
   * Validates file immediately to provide instant feedback
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Clear previous image error
      if (fieldErrors.image) {
        setFieldErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    } else {
      setImageFile(null);
    }
  };

  /**
   * Handles form submission
   *
   * Process:
   * 1. Validates required fields
   * 2. Parses tags from comma-separated string to array
   * 3. Parses agenda from newline-separated string (or uses description as fallback)
   * 4. Creates FormData with all fields including image file
   * 5. Submits to /api/events endpoint
   * 6. Shows success message and redirects to home page
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      // Validate form using centralized validation function
      const validation = validateEventForm(formData, imageFile);

      if (!validation.isValid) {
        setFieldErrors(validation.errors);
        // Focus on first error field
        const firstErrorField = Object.keys(validation.errors)[0];
        if (firstErrorField) {
          const element = document.getElementById(firstErrorField);
          element?.focus();
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setIsSubmitting(false);
        return;
      }

      // Parse tags from comma-separated string to array
      // Example: "react, next, js" -> ["react", "next", "js"]
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Parse agenda from newline-separated string or use description as default
      // Frontend fallback: if agenda is empty, use description as single agenda item
      // This matches the API's fallback logic
      const agendaArray = formData.agenda
        ? formData.agenda
            .split('\n')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        : [formData.description]; // Use description as default agenda if not provided

      // Create FormData for multipart/form-data submission (required for file upload)
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
      // Convert arrays to JSON strings for FormData (FormData only accepts strings/files)
      submitData.append('tags', JSON.stringify(tagsArray));
      submitData.append('agenda', JSON.stringify(agendaArray));
      submitData.append('image', imageFile);

      // Submit form data to API endpoint
      const response = await fetch('/api/events', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle field-specific errors from API if available
        if (data.errors && typeof data.errors === 'object') {
          setFieldErrors(data.errors);
        } else {
          setError(data.message || 'Failed to create event');
        }
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      // Reset form on success
      setFormData({
        title: '',
        date: '',
        time: '',
        venue: '',
        location: '',
        mode: 'offline',
        description: '',
        overview: '',
        organizer: '',
        audience: '',
        tags: '',
        agenda: '',
      });
      setImageFile(null);

      // Redirect to home page after 2 seconds to show success message
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Event Created Successfully!
          </h1>
          <p className="text-light-100">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <section className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-center text-4xl font-bold mb-12">
            Create an Event
          </h1>

          <form
            onSubmit={handleSubmit}
            className="bg-dark-100 border border-dark-200 rounded-lg p-8 space-y-6"
          >
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 rounded-lg p-4">
                {error}
              </div>
            )}

            <FormField
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
              required
              error={fieldErrors.title}
              maxLength={VALIDATION.MAX_TITLE_LENGTH}
              showCharCount
            />

            <FormFieldWithIcon
              label="Event Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              icon="/icons/calendar.svg"
              iconAlt="calendar"
              required
              error={fieldErrors.date}
              min={new Date().toISOString().split('T')[0]}
            />

            <FormFieldWithIcon
              label="Event Time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              icon="/icons/clock.svg"
              iconAlt="clock"
              required
              error={fieldErrors.time}
            />

            <FormFieldWithIcon
              label="Event Location"
              name="venue"
              type="text"
              value={formData.venue}
              onChange={handleInputChange}
              icon="/icons/pin.svg"
              iconAlt="location"
              placeholder="Enter venue or online link"
              required
              error={fieldErrors.venue}
            />

            <FormField
              label="Location Address"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter full address (e.g., City, Country)"
              required
              error={fieldErrors.location}
            />

            <FormSelect
              label="Event Type"
              name="mode"
              value={formData.mode}
              onChange={handleInputChange}
              icon="/icons/mode.svg"
              iconAlt="mode"
              options={[
                { value: 'online', label: 'Online' },
                { value: 'offline', label: 'Offline' },
                { value: 'hybrid', label: 'Hybrid' },
              ]}
              required
              error={fieldErrors.mode}
              placeholder="Select event type"
            />

            <FormFileUpload
              label="Event Image / Banner"
              name="image"
              onChange={handleFileChange}
              required
              error={fieldErrors.image}
              selectedFile={imageFile}
              maxSizeMB={VALIDATION.MAX_FILE_SIZE / (1024 * 1024)}
              allowedFormats="JPEG, PNG, WebP"
            />

            <FormField
              label="Tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Add tags such as react, next, js"
              required
              error={fieldErrors.tags}
              helpText="Separate tags with commas"
            />

            <FormTextarea
              label="Event Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Briefly describe the event"
              required
              error={fieldErrors.description}
              maxLength={VALIDATION.MAX_DESCRIPTION_LENGTH}
              showCharCount
              rows={4}
            />

            <FormTextarea
              label="Overview"
              name="overview"
              value={formData.overview}
              onChange={handleInputChange}
              placeholder="Brief overview of the event"
              error={fieldErrors.overview}
              maxLength={VALIDATION.MAX_OVERVIEW_LENGTH}
              showCharCount
              rows={3}
            />

            <FormField
              label="Organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleInputChange}
              placeholder="Event organizer name"
            />

            <FormField
              label="Target Audience"
              name="audience"
              value={formData.audience}
              onChange={handleInputChange}
              placeholder="e.g., Developers, Designers, etc."
            />

            <FormTextarea
              label="Agenda"
              name="agenda"
              value={formData.agenda}
              onChange={handleInputChange}
              placeholder="Enter agenda items, one per line"
              helpText="Enter one agenda item per line"
              rows={4}
            />

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
    </Suspense>
  );
};

export default CreateEventPage;
