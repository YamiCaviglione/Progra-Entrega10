//components/Header.tsx
export default function Header() {
  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 py-3">
        <h1 className="text-xl font-bold">📚 Libroteca</h1>
        <nav>
          <ul className="flex space-x-4">
            {/* <li><a href="/" className="hover:text-blue-200">Inicio</a></li> */}
            {/* <li><a href="/about" className="hover:text-blue-200">Acerca</a></li> */}
          </ul>
        </nav>
      </div>
    </header>
  );
}
