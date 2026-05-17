import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const STATUS_COLORS = {
  open: '#3B82F6',
  in_progress: '#F59E0B',
  resolved: '#10B981'
};

export default function StatusPieChart({ data }) {
  return (
    <section className="card">
      <h2 className="text-base font-semibold text-gray-900">Pending vs Resolved</h2>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80}>
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] || '#94A3B8'}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
