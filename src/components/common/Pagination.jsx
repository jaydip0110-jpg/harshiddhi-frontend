export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex justify-center gap-2 mt-8">
      {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-full text-sm font-semibold transition-all
            ${p === page
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary'
            }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
