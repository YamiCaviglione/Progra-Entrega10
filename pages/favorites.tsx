// pages/favorites.tsx
//muestra la lista de libros fav del user actual usando el hook
import { useFavorites } from "../hooks/useFavorites";
import Layout from "../components/Layout";
import Link from "next/link";
import { useRouter } from "next/router";

export default function FavoritesPage() {
  const { favorites = [], isLoading } = useFavorites();
  const router = useRouter();

  if (isLoading)
    return (
      <Layout>
        <p>Cargando favoritos...</p>
      </Layout>
    );
  //   if (error) return <Layout><p>Error al cargar favoritos.</p></Layout>;

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📚 Mis Favoritos</h1>
        <button
          onClick={() => router.back()}
          className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300"
        >
          ← Volver
        </button>
      </div>

      {favorites.length === 0 ? (
        <p className="text-gray-600">Todavía no agregaste libros a favoritos.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <li key={fav.bookId} className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold text-lg mb-2">{fav.title}</h2>
              <Link href={`/books/${fav.bookId}`}>
                <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                  Ver detalles
                </button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Layout>
  );
}