export default function Loading() {
  return (
    <div className="container-page py-20" role="status" aria-label="Loading">
      <div className="skeleton h-10 w-2/3 max-w-xl" />
      <div className="skeleton mt-4 h-5 w-1/2 max-w-md" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="skeleton h-72 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
