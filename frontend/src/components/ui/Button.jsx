import Spinner from './Spinner';

const variants = {
  primary: 'btn-primary',
  secondary:
    'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  danger:
    'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
};

export default function Button({
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`${variants[variant] || variants.primary} ${className}`}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {loading ? <Spinner size="sm" className="border-white" /> : null}
        {children}
      </span>
    </button>
  );
}
