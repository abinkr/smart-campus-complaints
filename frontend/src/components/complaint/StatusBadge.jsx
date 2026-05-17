const statusStyles = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700'
};

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved'
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.open;
  const label = statusLabels[status] || statusLabels.open;

  return <span className={`badge-base ${style}`}>{label}</span>;
}
