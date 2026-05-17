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

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Element
        id={id}
        ref={ref}
        className={`input-base ${as === 'textarea' ? 'min-h-[112px]' : ''} ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
});

export default Input;
