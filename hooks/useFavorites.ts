// hooks/useFavorites.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type Favorite = { bookId: string; title?: string };

export const useFavorites = (currentUser: any) => {
  const queryClient = useQueryClient();

  // 🔄 Obtener favoritos (cache aislado por usuario)
  const { data, isLoading, error } = useQuery<Favorite[], Error>({
    queryKey: ["favorites", currentUser?.id], // 👈 ahora depende del usuario
    queryFn: async () => {
      const res = await fetch("/api/users/favorites");
      if (!res.ok) throw new Error("Error al obtener favoritos");
      const json = await res.json();
      return json.favorites;
    },
    enabled: !!currentUser, // solo si está logueado
  });

  // ➕ Agregar favorito
  const addFavorite = useMutation<any, Error, Favorite>({
    mutationFn: async (book) => {
      const res = await fetch("/api/users/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(book),
      });
      if (!res.ok) throw new Error("No se pudo agregar favorito");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Libro agregado a favoritos ❤️");
      queryClient.invalidateQueries({ queryKey: ["favorites", currentUser?.id] }); // 👈 invalida cache del user actual
    },
    onError: (err) => toast.error(err.message),
  });

  // ➖ Quitar favorito
  const removeFavorite = useMutation<any, Error, string>({
    mutationFn: async (bookId) => {
      const res = await fetch("/api/users/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) throw new Error("No se pudo eliminar favorito");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Libro eliminado de favoritos 💔");
      queryClient.invalidateQueries({ queryKey: ["favorites", currentUser?.id] }); // 👈 idem
    },
    onError: (err) => toast.error(err.message),
  });

  return { favorites: data || [], isLoading, error, addFavorite, removeFavorite };
};
