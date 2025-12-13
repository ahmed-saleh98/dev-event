import Image from 'next/image';

/**
 * FormSelect Component
 * 
 * Reusable select dropdown component with optional icon and validation.
 */
interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  icon?: string;
  iconAlt?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

export const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  icon,
  iconAlt,
  required = false,
  error,
  placeholder = 'Select an option',
  className = '',
}: FormSelectProps) => {
  const fieldId = name;
  const errorId = `${name}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-light-100 text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <Image
            src={icon}
            alt={iconAlt || ''}
            width={20}
            height={20}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
            aria-hidden="true"
          />
        )}
        <select
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className={`bg-dark-200 rounded-lg px-5 py-2.5 ${
            icon ? 'pl-12' : 'pl-5'
          } text-light-100 w-full appearance-none focus:outline-none focus:ring-2 cursor-pointer ${
            error
              ? 'focus:ring-red-500 border border-red-500'
              : 'focus:ring-primary'
          } ${className}`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Image
          src="/icons/arrow-down.svg"
          alt="dropdown"
          width={16}
          height={16}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
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

