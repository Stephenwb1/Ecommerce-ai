export default function Header() {
  return (
    <header className="bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <span className="text-xl font-semibold tracking-tight text-zinc-900">ThreadLine</span>
        <nav className="flex gap-6">
          <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Shop</a>
          <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">About</a>
          <a href="#" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  );
}
