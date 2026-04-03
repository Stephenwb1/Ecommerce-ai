const categoryBg: Record<string, string> = {
  outerwear: "bg-zinc-100",
  tops: "bg-sky-100",
  loungewear: "bg-amber-100",
  accessories: "bg-emerald-100",
};

export default function ProductPlaceholderImage({ category }: { category: string }) {
  const bg = categoryBg[category] ?? "bg-zinc-100";

  return (
    <div className={`${bg} h-52 flex items-center justify-center`}>
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-zinc-400"
      >
        {/* Clothes hanger */}
        <path d="M20.38 18H3.62a1 1 0 0 1-.7-1.71L12 8" />
        <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <line x1="12" y1="8" x2="12" y2="6" />
      </svg>
    </div>
  );
}
