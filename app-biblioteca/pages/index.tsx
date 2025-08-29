import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Link from "next/link";

// Definimos la interfaz para tipar correctamente los libros
interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: {
      thumbnail?: string;
    };
  };
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]); // usamos Book[] en vez de any
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('title'); // title | author | isbn

  // Buscar libros usando la API de Google Books
  const buscarLibros = async (valor: string) => {
    if (valor.trim().length > 2) {
      setLoading(true);

      let queryParam = valor;
      if (filter === 'author') queryParam = `inauthor:${valor}`;
      if (filter === 'isbn') queryParam = `isbn:${valor}`;

      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryParam)}`
      );
      const data = await res.json();
      setBooks(data.items || []); // si no hay resultados, setBooks a array vacío
      setLoading(false);
    } else {
      setBooks([]);
      setLoading(false);
    }
  };

  // Sugerencias en tiempo real mientras escribimos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    buscarLibros(value);
  };

  // Buscar al apretar el botón
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buscarLibros(query);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-pink-50">
      <Header />

      <main className="flex-grow max-w-4xl mx-auto px-4 py-12">
        {/* Buscador */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center gap-4 mb-10">
          <input
            type="text"
            placeholder="Buscar libros..."
            className="w-full md:w-2/3 p-3 text-lg border rounded-xl"
            value={query}
            onChange={handleChange}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-3 border rounded-xl"
          >
            <option value="title">Título</option>
            <option value="author">Autor</option>
            <option value="isbn">ISBN</option>
          </select>
          <button type="submit" className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow">
            Buscar
          </button>
        </form>

        {loading && (
          <p className="text-gray-500 text-center">Cargando...</p>
        )}

        {/* Grid de libros */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {books.map((book: Book) => { // usamos Book en vez de any
            const info = book.volumeInfo;
            return (
              <Link href={`/books/${book.id}`} key={book.id}>
                <div className="bg-white rounded-xl shadow-lg hover:shadow-pink-200 overflow-hidden transition cursor-pointer flex flex-col items-center p-4 hover:scale-105">
                  <img
                    src={info.imageLinks?.thumbnail || '/no-cover.png'}
                    alt={info.title}
                    className="w-28 h-40 object-cover rounded-lg mb-3 border border-blue-100"
                  />
                  <div className="text-center">
                    <h3 className="font-semibold text-base mb-1 text-blue-700">{info.title}</h3>
                    <p className="text-xs text-gray-500">{info.authors?.join(', ')}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>  
      </main>

      <Footer />
    </div>
  );
}
