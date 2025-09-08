// hooks/useLogout.ts
// Hook para hacer logout (POST /api/users/logout)
// - Borra la cookie en el backend y refresca currentUser
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const res = await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error((body && body.error) || "Error al desloguear");
      }
      return;
    },
    onSuccess: async () => {
      // refrescar user y redirigir a home (opcional)
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/"); // redirige al home después del logout
    },
  });
};
