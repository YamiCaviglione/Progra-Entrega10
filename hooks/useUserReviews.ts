// hooks/useUserReviews.ts
import { useQuery } from "@tanstack/react-query";

export function useUserReviews() {
  return useQuery({
    queryKey: ["userReviews"],
    queryFn: async () => {
      const res = await fetch("/api/users/reviews");
      if (!res.ok) throw new Error("Error al obtener reseñas del usuario");
      return res.json();
    },
  });
}
