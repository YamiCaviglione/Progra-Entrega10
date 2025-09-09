import { useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useReviews } from "../hooks/useReviews";
import { useVotes } from "../hooks/useVotes";

interface ReviewCardProps {
  review: {
    _id: string;
    text: string;
    rating: number;
    userId: { _id: string; name: string };
  };
  bookId: string;
}

export default function ReviewCard({ review, bookId }: ReviewCardProps) {
  const { data: currentUser } = useCurrentUser();
  const { updateReview, deleteReview } = useReviews(bookId);
  const { counts, loadingCounts, createVote } = useVotes(review._id);

  // Estado para edición
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(review.text);
  const [rating, setRating] = useState(review.rating);

  const isOwner = currentUser?.id === review.userId._id;

  return (
    <li className="bg-white p-4 rounded shadow flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold">{review.userId.name}</span>
        <span className="text-yellow-500">
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </span>
      </div>

      {editing ? (
        <>
          <textarea
            className="w-full border rounded p-2 mb-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border rounded p-1 w-16 mb-2"
          />
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-blue-500 text-white rounded"
              onClick={() => {
                updateReview.mutate({ id: review._id, text, rating });
                setEditing(false);
              }}
            >
              Guardar
            </button>
            <button
              className="px-3 py-1 bg-gray-300 rounded"
              onClick={() => setEditing(false)}
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <p className="mb-2">{review.text}</p>
      )}

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

        {/* Botones solo para el dueño */}
        {isOwner && !editing && (
          <>
            <button
              className="px-2 py-1 bg-yellow-200 rounded"
              onClick={() => setEditing(true)}
            >
              ✏️ Editar
            </button>
            <button
              className="px-2 py-1 bg-red-300 rounded"
              onClick={() => deleteReview.mutate({ id: review._id })}
            >
              🗑️ Borrar
            </button>
          </>
        )}
      </div>
    </li>
  );
}
