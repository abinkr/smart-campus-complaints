import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export default function CategoryBarChart({ data }) {
  return (
    <section className="card">
      <h2 className="text-base font-semibold text-gray-900">Complaints by Category</h2>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="category" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
