export default function Spinner({ size = 'md', className = '', fullPage = false }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-[3px]'
  };

  const spinner = (
    <span
      className={`inline-block animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size] || sizeClasses.md} ${className}`}
      aria-label="Loading"
      role="status"
    />
  );

  if (fullPage) {
    return <div className="grid min-h-screen place-items-center bg-gray-50">{spinner}</div>;
  }

  return (
    spinner
  );
}
