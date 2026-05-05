export default function SavedPage() {
  return (
    <div className="max-w-2xl mx-auto text-center py-20">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        style={{ background: "linear-gradient(135deg, rgba(255,207,197,0.5), rgba(255,208,174,0.4))" }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(102,12,13,0.6)" strokeWidth="1.8">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <h1 className="text-2xl font-display font-medium text-brand mb-2">Saved items</h1>
      <p className="text-brand-soft text-sm leading-relaxed max-w-xs mx-auto">
        Heart pieces you love and they&apos;ll show up here. Coming soon.
      </p>
    </div>
  );
}
