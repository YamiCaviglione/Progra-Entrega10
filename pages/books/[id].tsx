import { GetServerSideProps } from "next";
import { useState } from "react";
import { getBookById } from "../../utils/googleBooks";
import { Book } from "../../types";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useFavorites } from "../../hooks/useFavorites";
import { useReviews } from "../../hooks/useReviews";
import ReviewCard from "../../components/ReviewCard";
import toast from "react-hot-toast";

interface Props {
  book: Book | null;
}

const BookPage: React.FC<Props> = ({ book }) => {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { favorites = [], addFavorite, removeFavorite } = useFavorites(currentUser);
  const { reviews, isLoading, error, addReview } = useReviews(book?.id ?? "");

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  if (!book) return <Layout><p>Libro no encontrado</p></Layout>;

  const isFavorite = favorites.some(
    (f: { bookId: string }) => f.bookId === book.id
  );

  // ✅ Saber si el usuario YA reseñó este libro
  const userAlreadyReviewed = currentUser
    ? reviews.some((r) => r.userId?._id === currentUser.id) // ojo: backend debe enviar _id
    : false;

  const handleFavorite = () => {
    if (!currentUser) {
      toast.error("Debes iniciar sesión para agregar favoritos");
      return;
    }

    if (isFavorite) removeFavorite.mutate(book.id);
    else addFavorite.mutate({ bookId: book.id, title: book.title });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text) return;

    addReview.mutate({ rating, text });
    setRating(5);
    setText("");
  };

  return (
    <Layout>
      {/* 🔙 Botón volver atrás */}
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
      >
        ← Volver atrás
      </button>

      {/* 📖 Info libro */}
      <div className="flex flex-col md:flex-row gap-8 bg-white p-6 rounded-lg shadow">
        <img
          src={book.image}
          alt={book.title}
          className="w-48 h-64 object-cover mx-auto md:mx-0"
        />
        <div>
          <h1 className="text-3xl font-bold text-blue-700 mb-2">{book.title}</h1>
          <p className="text-gray-600 mb-2">{book.authors.join(", ")}</p>
          <p className="mb-4">{book.description}</p>
          <p className="text-sm text-gray-500">
            Publicado: {book.publishedDate} | Páginas: {book.pageCount} | Categorías:{" "}
            {book.categories.join(", ")}
          </p>

          {/* ❤️ Favoritos */}
          {currentUser && (
            <button
              onClick={handleFavorite}
              disabled={addFavorite.isPending || removeFavorite.isPending} // ⏳ bloquea mientras carga
              className={`mt-2 px-3 py-1 rounded ${
                isFavorite
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              } ${addFavorite.isPending || removeFavorite.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {addFavorite.isPending || removeFavorite.isPending
                ? "Procesando..."
                : isFavorite
                ? "❤️ Quitar favorito"
                : "🤍 Agregar favorito"}
            </button>
          )}

        </div>
      </div>
      {/* quiero votar mi propia resena y me aparece error 405 (creo q esta bien porq desde el back no me deberia dejar votar mi propia resena). pero en ese caso ni siquiera tendrian 
      que aparecer los dos botones de like y dislike si la resena es mia. solo deben aparecer si la resena es ajena y el usuario esta autenticado. decime que codigos necesitas que te pase y pasame el codigo comentado e indicando ubicacion. sin romper nada de lo
      que ya tengo porfi :)  */}

      {/* ✍️ Formulario reseña */}
      {currentUser && !userAlreadyReviewed && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Agregar Reseña</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="p-2 border rounded w-32"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} estrella{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Escribe tu reseña..."
              className="p-2 border rounded"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={addReview.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {addReview.isPending ? "Enviando..." : "Enviar Reseña"}
            </button>
          </form>
        </div>
      )}

      {/* 📝 Lista reseñas */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Reseñas de la comunidad</h2>

        {isLoading ? (
          <p>Cargando reseñas...</p>
        ) : error ? (
          <p className="text-red-500">Error al cargar reseñas.</p>
        ) : reviews.length === 0 ? (
          currentUser ? (
            <p className="text-gray-500">Sé el primero en reseñar este libro.</p>
          ) : (
            <p className="text-gray-500">Debes iniciar sesión para dejar una reseña.</p>
          )
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((r) => (
              <ReviewCard key={r._id} review={r} bookId={book.id} />
            ))}
          </ul>
        )}
      </div>

    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const book = await getBookById(id as string);
  return { props: { book } };
};

export default BookPage;
