// hooks/useRegister.ts
// Hook para registrar usuarios (POST /api/users/register)
// - Usa React Query useMutation con toasts mejorados
// - Invalida la query "currentUser" al completar (para refrescar estado)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface RegisterResponse {
  id: string;
  email: string;
  name?: string;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, Error, RegisterData>({
    mutationFn: async (data) => {
      // Toast de carga
      const loadingToast = toast.loading("Creando tu cuenta...");
      
      try {
        const res = await fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // asegura que el browser guarde la cookie HTTP-only
          body: JSON.stringify(data),
        });

        // manejar error con mensaje específico si viene
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          const errorMessage = errorData?.error || "Error en el servidor";
          throw new Error(errorMessage);
        }

        const result = await res.json();
        toast.dismiss(loadingToast);
        return result;
      } catch (error) {
        toast.dismiss(loadingToast);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success(`¡Registro exitoso! Bienvenido${data.name ? `, ${data.name}` : ''} 🎉`);
      // refrescar currentUser para que la app detecte el login automático
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error) => {
      // Toast de error se manejará en el componente para más control
      console.error("Error en registro:", error.message);
    }
  });
};
