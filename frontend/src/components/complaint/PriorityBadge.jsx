const priorityStyles = {
  pending: 'bg-gray-100 text-gray-600',
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700'
};

const priorityLabels = {
  pending: 'Classifying',
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

export default function PriorityBadge({ priority }) {
  const key = priority || 'pending';
  const style = priorityStyles[key] || priorityStyles.pending;
  const label = priorityLabels[key] || priorityLabels.pending;
  return <span className={`badge-base ${style}`}>{label}</span>;
}
