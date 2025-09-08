// hooks/useRegister.ts
// Hook para registrar usuarios (POST /api/users/register)
// - Usa React Query useMutation
// - Invalida la query "currentUser" al completar (para refrescar estado)
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, RegisterData>({
    mutationFn: async (data) => {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // asegura que el browser guarde la cookie HTTP-only
        body: JSON.stringify(data),
      });

      // manejar error con mensaje si viene
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error((body && body.error) || "Error en el registro");
      }

      return res.json();
    },
    onSuccess: () => {
      // refrescar currentUser para que la app detecte el login automático
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};
