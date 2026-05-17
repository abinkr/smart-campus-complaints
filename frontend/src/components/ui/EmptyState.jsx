export default function EmptyState({ title, description }) {
  return (
    <section className="card text-center">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </section>
  );
}
