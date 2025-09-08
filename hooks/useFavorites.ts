import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Favorite = { bookId: string; title?: string };

export const useFavorites = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Favorite[], Error>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const res = await fetch("/api/users/favorites");
      if (!res.ok) throw new Error("Error al obtener favoritos");
      const json = await res.json();
      return json.favorites; // <-- debe ser array de objetos
    },
  });

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return { favorites: data || [], isLoading, addFavorite, removeFavorite };
};