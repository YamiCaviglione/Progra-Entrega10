// utils/googleBooks.ts
//permmite buscar libros y obtener sus detalles segun su id
import { Book } from "../types";

export const searchBooks = async (query: string): Promise<Book[]> => {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (!data.items) return [];

  return data.items.map((item: any) => ({
    id: item.id,
    title: item.volumeInfo.title || "Sin título",
    authors: item.volumeInfo.authors || ["Desconocido"],
    description: item.volumeInfo.description || "Sin descripción",
    image: item.volumeInfo.imageLinks?.thumbnail || "/no-image.png",
    publishedDate: item.volumeInfo.publishedDate || "N/A",
    pageCount: item.volumeInfo.pageCount || 0,
    categories: item.volumeInfo.categories || [],
  }));
};

export const getBookById = async (id: string): Promise<Book | null> => {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
  const data = await res.json();
  if (!data) return null;

  const info = data.volumeInfo;

  return {
    id: data.id,
    title: info.title || "Sin título",
    authors: info.authors || ["Desconocido"],
    description: info.description || "Sin descripción",
    image: info.imageLinks?.thumbnail || "/no-image.png",
    publishedDate: info.publishedDate || "N/A",
    pageCount: info.pageCount || 0,
    categories: info.categories || [],
  };
};
