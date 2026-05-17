export default function DepartmentTable({ data }) {
  return (
    <section className="card">
      <h2 className="text-base font-semibold text-gray-900">Department Performance</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-2">Department</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Resolved</th>
              <th className="px-3 py-2">Avg Resolution (Days)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.department} className="border-b border-gray-100 last:border-0">
                <td className="px-3 py-3 font-medium text-gray-900">{row.department}</td>
                <td className="px-3 py-3 text-gray-700">{row.totalComplaints}</td>
                <td className="px-3 py-3 text-gray-700">{row.resolved}</td>
                <td className="px-3 py-3 text-gray-700">{row.avgResolutionDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
