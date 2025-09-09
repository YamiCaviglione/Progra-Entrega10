import { useQuery } from "@tanstack/react-query";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  favorites: string[];
  createdAt?: string; //opcional para no romper TS
  updatedAt?: string;
};

export function useCurrentUser() {
  return useQuery<CurrentUser | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (res.status === 401) return null; // no logueado
      if (!res.ok) throw new Error("Error al obtener usuario actual");
      return res.json();
    },
    retry: false,
  });
}
