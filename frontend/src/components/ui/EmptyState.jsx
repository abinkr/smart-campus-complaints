export default function EmptyState({ title, description }) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container mb-4 flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px] text-on-surface-variant" style={{ fontVariationSettings: '"wght" 200' }}>
          inbox
        </span>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-primary mb-2 font-bold">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-md">{description}</p>
    </section>
  );
}
