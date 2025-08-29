// components/BookCard.tsx
import Link from "next/link";
import { Book } from "../types";

interface Props {
  book: Book;
}

const BookCard: React.FC<Props> = ({ book }) => {
  return (
    <div className="bg-white border rounded-lg shadow hover:shadow-xl transition overflow-hidden">
      <img
        src={book.image}
        alt={book.title}
        className="w-full h-56 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg text-blue-700 truncate">{book.title}</h3>
        <p className="text-sm text-gray-600">{book.authors.join(", ")}</p>
        <Link
          href={`/books/${book.id}`}
          className="block mt-3 text-blue-500 hover:underline"
        >
          Ver detalles →
        </Link>
      </div>
    </div>
  );
};

export default BookCard;
