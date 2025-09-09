import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUserReviews } from "../hooks/useUserReviews";

export default function ProfilePage() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews();

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
                <p className="font-semibold">Libro: {r.bookId}</p>
                <p className="text-gray-700">{r.comment}</p>
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
