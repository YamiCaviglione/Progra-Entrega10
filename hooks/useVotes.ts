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

export const useVotes = () => {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["votes", variables.reviewId] });
    },
  });

  const deleteVote = useMutation<any, Error, string>({
    mutationFn: async (voteId) => {
      const res = await fetch(`/api/votes/${voteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo eliminar voto");
      return res.json();
    },
    onSuccess: (_, voteId) => {
      queryClient.invalidateQueries({ queryKey: ["votes", voteId] });
    },
  });

  return {
    createVote,
    deleteVote,
  };
};
