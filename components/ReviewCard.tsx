// components/ReviewCard.tsx
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

  // ------------------------------------------------------------------
  // CORRECCIÓN IMPORTANTE:
  // - useCurrentUser devuelve `id` (string) según tu tipo CurrentUser.
  // - review.userId._id viene de Mongo (ObjectId o string). Convertimos a string.
  // - Comparamos currentUser?.id con String(review.userId._id).
  //
  // Esto evita el error TS: "Property '_id' does not exist on type 'CurrentUser'".
  // ------------------------------------------------------------------
  const isOwner = !!currentUser && String(review.userId._id) === currentUser.id;

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
        {/* 👍👎 SOLO si el usuario está logueado y NO es dueño */}
        {currentUser && !isOwner && (
          <>
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
          </>
        )}

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
