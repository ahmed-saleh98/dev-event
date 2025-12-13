/**
 * FormField Component
 * 
 * Reusable text input field component with validation, character counting,
 * and accessibility features.
 */
interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  showCharCount?: boolean;
  helpText?: string;
  className?: string;
}

export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  maxLength,
  showCharCount = false,
  helpText,
  className = '',
}: FormFieldProps) => {
  const fieldId = name;
  const errorId = `${name}-error`;
  const helpId = `${name}-help`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-light-100 text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${errorId} ${helpId}` : helpId}
        maxLength={maxLength}
        className={`bg-dark-200 rounded-lg px-5 py-2.5 text-light-100 placeholder:text-light-200 focus:outline-none focus:ring-2 ${
          error
            ? 'focus:ring-red-500 border border-red-500'
            : 'focus:ring-primary'
        } ${className}`}
      />
      <div className="flex justify-between items-center">
        {showCharCount && maxLength && (
          <span id={helpId} className="text-light-200 text-xs">
            {value.length}/{maxLength} characters
          </span>
        )}
        {helpText && !showCharCount && (
          <span id={helpId} className="text-light-200 text-xs">
            {helpText}
          </span>
        )}
        {error && (
          <span id={errorId} role="alert" className="text-red-400 text-xs">
            {error}
          </span>
        )}
      </div>
    </div>
  );
};

