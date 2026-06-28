function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#e2e8f4] p-5 space-y-3 animate-pulse">
      <div className="h-4 w-1/3 rounded bg-[#e2e8f4]" />
      <div className="h-8 w-1/2 rounded bg-[#e2e8f4]" />
      <div className="h-3 w-2/3 rounded bg-[#f8fafd]" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded bg-[#f8fafd]" />
        </td>
      ))}
    </tr>
  );
}

export default function DashboardLoading() {
  return (
    <main className="flex-1 p-6 space-y-6">
      <div className="space-y-1">
        <div className="h-7 w-56 rounded bg-[#e2e8f4] animate-pulse" />
        <div className="h-4 w-72 rounded bg-[#f8fafd] animate-pulse" />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </section>

      <div className="rounded-xl border border-[#e2e8f4] overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}