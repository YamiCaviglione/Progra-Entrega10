// types/index.ts
export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  image: string;
  publishedDate: string;
  pageCount: number;
  categories: string[];
}

export interface Review {
  id: string;
  bookId: string;
  user: string;
  rating: number;
  comment: string;
  votes: number;
}
