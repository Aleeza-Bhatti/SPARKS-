export default function TodayLoading() {
  return (
    <div>
      <div className="mb-6">
        <div className="skeleton h-3 w-24 mb-2 rounded-full" />
        <div className="skeleton h-7 w-48 rounded-lg" />
      </div>

      {/* Loading bar */}
      <div className="loading-bar h-1.5 w-full rounded-full mb-6">
        <div className="loading-bar-fill" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white border border-[rgba(102,12,13,0.08)] card-hover">
            <div className="skeleton aspect-[3/4] w-full" style={{ borderRadius: 0 }} />
            <div className="p-3.5 space-y-2">
              <div className="skeleton h-2.5 w-16 rounded-full" />
              <div className="skeleton h-3.5 w-full rounded" />
              <div className="skeleton h-3 w-10 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
