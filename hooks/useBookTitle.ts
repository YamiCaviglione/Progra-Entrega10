// hooks/useBookTitles.ts
import { useQuery } from "@tanstack/react-query";

export function useBookTitles(bookIds: string[]) {
  return useQuery({
    queryKey: ["bookTitles", bookIds],
    queryFn: async () => {
      const results: Record<string, string> = {};
      for (const id of bookIds) {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
        if (res.ok) {
          const data = await res.json();
          results[id] = data.volumeInfo?.title || id;
        } else {
          results[id] = id; // fallback
        }
      }
      return results;
    },
    enabled: bookIds.length > 0,
  });
}
