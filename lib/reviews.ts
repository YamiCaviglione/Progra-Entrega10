export interface Review {
  id: string;
  user: string;
  rating: number;
  text: string;
  upvotes: number;
  downvotes: number;
  userVote?: "like" | "dislike" | null;
}

// Lógica de voto único (exactamente como en tu página)
export function voteReview(
  reviews: Review[],
  id: string,
  type: "like" | "dislike"
): Review[] {
  return reviews.map((r) => {
    if (r.id !== id) return r;

    // Si ya votó del mismo tipo, no hace nada
    if (r.userVote === type) return r;

    let newUpvotes = r.upvotes;
    let newDownvotes = r.downvotes;

    // Si cambia de voto, restamos el anterior
    if (r.userVote === "like" && type === "dislike") newUpvotes -= 1;
    if (r.userVote === "dislike" && type === "like") newDownvotes -= 1;

    // Sumamos el nuevo
    if (type === "like") newUpvotes += 1;
    if (type === "dislike") newDownvotes += 1;

    return { ...r, upvotes: newUpvotes, downvotes: newDownvotes, userVote: type };
  });
}
