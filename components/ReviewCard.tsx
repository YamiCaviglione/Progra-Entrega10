import { useVotes } from "../hooks/useVotes";

interface ReviewCardProps {
  review: {
    _id: string;
    text: string;
    rating: number;
    user?: { name: string }; // 👈 user puede venir undefined
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const { counts, loadingCounts, createVote } = useVotes(review._id);

  return (
    <li className="bg-white p-4 rounded shadow flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        {/* 👇 fallback si no hay user */}
        <span className="font-bold">
          {review.user?.name || "Usuario anónimo"}
        </span>
        <span className="text-yellow-500">
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </span>
      </div>
      <p className="mb-2">{review.text}</p>
      <div className="flex items-center gap-4 text-sm">
        <button
          className="px-2 py-1 rounded bg-green-100 hover:bg-green-200"
          onClick={() => createVote.mutate({ reviewId: review._id, vote: 1 })}
          disabled={loadingCounts}
        >
          👍 {counts?.positive ?? 0}
        </button>
        <button
          className="px-2 py-1 rounded bg-red-100 hover:bg-red-200"
          onClick={() => createVote.mutate({ reviewId: review._id, vote: -1 })}
          disabled={loadingCounts}
        >
          👎 {counts?.negative ?? 0}
        </button>
      </div>
    </li>
  );
}
