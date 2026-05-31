import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    id,
    label,
    error,
    as = 'input',
    className = '',
    ...props
  },
  ref
) {
  const Element = as;
  const Icon = props.icon;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="label-base">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <Element
          id={id}
          ref={ref}
          className={`input-base ${as === 'textarea' ? 'min-h-[112px]' : ''} ${
            Icon ? 'pl-10' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
});

export default Input;
