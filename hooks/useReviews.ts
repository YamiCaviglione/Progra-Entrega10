// hooks/useReviews.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Review {
  _id: string;
  bookId: string;
  userId: { name: string; email: string };
  rating: number;
  text: string;
  upvotes: number;
  downvotes: number;
}

export const useReviews = (bookId: string) => {
  const queryClient = useQueryClient();

  // Obtener reseñas
  const { data: reviews = [], isLoading, error } = useQuery<Review[]>({
    queryKey: ["reviews", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?bookId=${bookId}`);
      if (!res.ok) throw new Error("No se pudieron cargar reseñas");
      return res.json();
    },
  });

  // Crear reseña
  const addReview = useMutation<
    Review,
    Error,
    { rating: number; text: string }
  >({
    mutationFn: async ({ rating, text }) => {
      const res = await fetch("/api/reviews/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, rating, text }),
      });
      if (!res.ok) throw new Error("No se pudo crear la reseña");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
    },
  });

  return { reviews, isLoading, error, addReview };
};
