/**
 * FormFileUpload Component
 * 
 * Reusable file upload component with custom styling and validation feedback.
 */
interface FormFileUploadProps {
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  required?: boolean;
  error?: string;
  selectedFile?: File | null;
  maxSizeMB?: number;
  allowedFormats?: string;
  className?: string;
}

export const FormFileUpload = ({
  label,
  name,
  onChange,
  accept = 'image/jpeg,image/png,image/webp',
  required = false,
  error,
  selectedFile,
  maxSizeMB = 5,
  allowedFormats = 'JPEG, PNG, WebP',
  className = '',
}: FormFileUploadProps) => {
  const fieldId = name;
  const errorId = `${name}-error`;
  const helpId = `${name}-help`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-light-100 text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          type="file"
          id={fieldId}
          name={name}
          accept={accept}
          onChange={onChange}
          required={required}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${errorId} ${helpId}` : helpId}
          className="hidden"
        />
        <label
          htmlFor={fieldId}
          className={`bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 w-full flex items-center gap-3 cursor-pointer hover:bg-dark-200/80 transition-colors border ${
            error
              ? 'border-red-500'
              : 'border-transparent hover:border-primary/20'
          } ${className}`}
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
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="text-light-200">
            {selectedFile ? selectedFile.name : `Upload ${label.toLowerCase()}`}
          </span>
        </label>
      </div>
      <div className="flex justify-between items-center">
        <span id={helpId} className="text-light-200 text-xs">
          Max size: {maxSizeMB}MB. Formats: {allowedFormats}
        </span>
        {error && (
          <span id={errorId} role="alert" className="text-red-400 text-xs">
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

