import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUserReviews } from "../hooks/useUserReviews";
import { useBookTitles } from "../hooks/useBookTitle"; // 👈 nuevo import
import Link from "next/link";

export default function ProfilePage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews();

  // 📚 cargar títulos de todos los bookIds
  const bookIds = reviews?.map((r: any) => r.bookId) || [];
  const { data: titles } = useBookTitles(bookIds);

  if (userLoading) return <p className="p-4">Cargando perfil...</p>;
  if (!user) return <p className="p-4">Debes iniciar sesión para ver tu perfil.</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* 👤 Información de usuario */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
        <p className="text-gray-600">{user.email}</p>
        {user.createdAt && (
          <p className="text-sm text-gray-400">
            Miembro desde: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* 📝 Reseñas */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Mis reseñas</h2>

        {reviewsLoading ? (
          <p>Cargando reseñas...</p>
        ) : !reviews || reviews.length === 0 ? (
          <p className="text-gray-500">Todavía no escribiste ninguna reseña.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r: any) => (
              <li key={r._id} className="border-b pb-4">
                {/* 🔗 Link al detalle del libro */}
                <Link
                  href={`/books/${r.bookId}`}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {titles?.[r.bookId] || r.bookId}
                </Link>

                <p className="text-gray-700">{r.text}</p>
                <p className="text-sm text-gray-400">
                  Publicado: {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
