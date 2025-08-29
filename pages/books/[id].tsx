// pages/books/[id].tsx
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { getBookById } from "../../utils/googleBooks";
import { Book } from "../../types";
import Layout from "../../components/Layout";
import { useRouter } from "next/router";

interface Review {
  id: string;
  user: string;
  rating: number;
  text: string;
  upvotes: number;
  downvotes: number;
  userVote?: "like" | "dislike" | null; // Para votos únicos
}

interface Props {
  book: Book | null;
}

const BookPage: React.FC<Props> = ({ book }) => {
  const router = useRouter(); 
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  // Cargar reseñas desde localStorage
  useEffect(() => {
    if (book) {
      const saved = localStorage.getItem(`reviews-${book.id}`);
      setReviews(saved ? JSON.parse(saved) : []);
    }
  }, [book]);

  // Guardar reseñas en localStorage
  const saveReviews = (newReviews: Review[]) => {
    if (book) {
      localStorage.setItem(`reviews-${book.id}`, JSON.stringify(newReviews));
      setReviews(newReviews);
    }
  };

  // Agregar nueva reseña
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !text) return;
    const newReview: Review = {
      id: Date.now().toString(),
      user,
      rating,
      text,
      upvotes: 0,
      downvotes: 0,
      userVote: null, // Inicialmente sin votar
    };
    saveReviews([newReview, ...reviews]);
    setUser("");
    setRating(5);
    setText("");
  };

  // Lógica de voto único: un usuario solo puede dar like o dislike, no ambos
  const voteReview = (id: string, type: "like" | "dislike") => {
    const newReviews = reviews.map((r) => {
      if (r.id !== id) return r;

      // Si ya votó del mismo tipo, no hace nada
      if (r.userVote === type) return r;

      let newUpvotes = r.upvotes;
      let newDownvotes = r.downvotes;

      // Si cambia de voto, resta del otro contador
      if (r.userVote === "like" && type === "dislike") newUpvotes -= 1;
      if (r.userVote === "dislike" && type === "like") newDownvotes -= 1;

      // Suma el voto actual
      if (type === "like") newUpvotes += 1;
      if (type === "dislike") newDownvotes += 1;

      return {
        ...r,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVote: type,
      };
    });
    saveReviews(newReviews);
  };

  if (!book) return <Layout><p>Libro no encontrado</p></Layout>;

  return (
    <Layout>
      {/* Botón de volver atrás */}
      <button 
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
      >
        ← Volver atrás
      </button>

      {/* Información del libro */}
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
        </div>
      </div>

      {/* Formulario de reseña */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Agregar Reseña</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Tu nombre"
            className="p-2 border rounded"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            required
          />
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enviar Reseña
          </button>
        </form>
      </div>

      {/* Lista de reseñas con votos únicos */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Reseñas de la comunidad</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">Sé el primero en reseñar este libro.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((r) => (
              <li key={r.id} className="bg-white p-4 rounded shadow flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold">{r.user}</span>
                  <span className="text-yellow-500">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                <p className="mb-2">{r.text}</p>
                <div className="flex items-center gap-4 text-sm">
                  {/* Botones de like/dislike integrados con voto único */}
                  <button
                    className={`px-2 py-1 rounded ${
                      r.userVote === "like"
                        ? "bg-blue-600 text-white"
                        : "bg-green-100 hover:bg-green-200"
                    }`}
                    onClick={() => voteReview(r.id, "like")}
                  >
                    👍 {r.upvotes}
                  </button>
                  <button
                    className={`px-2 py-1 rounded ${
                      r.userVote === "dislike"
                        ? "bg-red-600 text-white"
                        : "bg-red-100 hover:bg-red-200"
                    }`}
                    onClick={() => voteReview(r.id, "dislike")}
                  >
                    👎 {r.downvotes}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

// Fetch del libro desde la API de Google Books
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  const book = await getBookById(id as string);
  return { props: { book } };
};

export default BookPage;
