import Link from "next/link";
import { Book } from "../types";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useFavorites } from "../hooks/useFavorites";

interface Props {
  book: Book;
}

const BookCard: React.FC<Props> = ({ book }) => {
  const { data: currentUser } = useCurrentUser();
  const { favorites = [], addFavorite, removeFavorite } = useFavorites();

  // Ver si el libro está en favoritos
  const isFavorite = favorites.some(
    (f: { bookId: string; title?: string }) => f.bookId === book.id
  );

  // Toggle favorito usando mutate de React Query
  const toggleFavorite = () => {
    if (!currentUser) return alert("Debes estar logueado para agregar favoritos");

    if (isFavorite) removeFavorite.mutate(book.id); // correcto: mutate
    else addFavorite.mutate({ bookId: book.id, title: book.title }); // correcto: mutate
  };

  return (
    <div className="bg-white border rounded-lg shadow hover:shadow-xl transition overflow-hidden">
      <img
        src={book.image}
        alt={book.title}
        className="w-full h-56 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg text-blue-700 truncate">{book.title}</h3>
        <p className="text-sm text-gray-600">{book.authors.join(", ")}</p>

        <div className="flex items-center justify-between mt-3">
          <Link href={`/books/${book.id}`} className="text-blue-500 hover:underline">
            Ver detalles →
          </Link>

          {currentUser && (
            <button
              onClick={toggleFavorite}
              className={`px-2 py-1 rounded ${
                isFavorite ? "bg-red-500 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {isFavorite ? "❤️" : "🤍"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
