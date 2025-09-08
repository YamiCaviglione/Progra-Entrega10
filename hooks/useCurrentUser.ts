import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
  name: string;
  favorites: string[];
}

export const useCurrentUser = () => {
  return useQuery<User, Error>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    },
    retry: false,
  });
};
