import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  id: string;
  email: string;
  name?: string;
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: async (data) => {
      // Toast de carga
      const loadingToast = toast.loading("Iniciando sesión...");
      
      try {
        const res = await fetch("/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });
        
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
      toast.success(`¡Bienvenido${data.name ? `, ${data.name}` : ''}! 🎉`);
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (error) => {
      // Toast de error se manejará en el componente para más control
      console.error("Error en login:", error.message);
    }
  });
};
