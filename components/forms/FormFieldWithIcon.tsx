import Image from 'next/image';

/**
 * FormFieldWithIcon Component
 * 
 * Text input field with a leading icon (used for date, time, location fields).
 */
interface FormFieldWithIconProps {
  label: string;
  name: string;
  type: 'text' | 'date' | 'time';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: string;
  iconAlt: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  min?: string;
  className?: string;
}

export const FormFieldWithIcon = ({
  label,
  name,
  type,
  value,
  onChange,
  icon,
  iconAlt,
  placeholder,
  required = false,
  error,
  min,
  className = '',
}: FormFieldWithIconProps) => {
  const fieldId = name;
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-light-100 text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <Image
          src={icon}
          alt={iconAlt}
          width={20}
          height={20}
          className="absolute left-4 top-1/2 transform -translate-y-1/2"
          aria-hidden="true"
        />
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
          aria-describedby={error ? errorId : undefined}
          min={min}
          className={`bg-dark-200 rounded-lg px-5 py-2.5 pl-12 text-light-100 ${
            type !== 'date' && type !== 'time' ? 'placeholder:text-light-200' : ''
          } w-full focus:outline-none focus:ring-2 ${
            error
              ? 'focus:ring-red-500 border border-red-500'
              : 'focus:ring-primary'
          } ${className}`}
        />
      </div>
      {error && (
        <span id={errorId} role="alert" className="text-red-400 text-xs">
          {error}
        </span>
      )}
    </div>
  );
};

