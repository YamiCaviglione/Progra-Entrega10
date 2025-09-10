// hooks/useVotes.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Vote {
  _id: string;
  userId: { name: string; email: string };
  reviewId: string;
  vote: number;
}

export interface VoteCount {
  positive: number;
  negative: number;
}

export const useVotes = (reviewId?: string) => {
  const queryClient = useQueryClient();

  // 🔹 Traer contadores
  const { data: counts, isLoading: loadingCounts } = useQuery<VoteCount>({
    queryKey: ["votes", reviewId],
    queryFn: async () => {
      if (!reviewId) return { positive: 0, negative: 0 };

      const res = await fetch(`/api/votes?reviewId=${reviewId}`);
      if (!res.ok) throw new Error("No se pudieron contar los votos");

      const json = await res.json();
      // ⚡ Extraemos voteCount del JSON
      return json.voteCount as VoteCount;
    },
    enabled: !!reviewId, // solo corre si hay reviewId
  });

  // ➕➖ Crear o toggle voto
  const createVote = useMutation<Vote, Error, { reviewId: string; vote: number }>({
    mutationFn: async ({ reviewId, vote }) => {
      const res = await fetch("/api/votes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, vote }),
      });
      if (!res.ok) throw new Error("No se pudo votar");
      return res.json();
    },
    onSuccess: (_, variables) => {
      // 🔄 Refrescar el conteo después de votar
      queryClient.invalidateQueries({ queryKey: ["votes", variables.reviewId] });
    },
  });

  return {
    counts,
    loadingCounts,
    createVote,
  };
};
