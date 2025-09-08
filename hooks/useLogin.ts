import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LoginData {
  email: string;
  password: string;
}

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, LoginData>({
    mutationFn: async (data) => {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error en login");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["currentUser"] }),

  });
};
