// pages/register.tsx
// Página de registro que usa useRegister (React Query) con toasts y mensajes mejorados
import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import { useRegister } from "../hooks/useRegister";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El email no es válido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (errorText: string) => {
    // Mapear errores específicos a mensajes más amigables
    if (errorText.includes("El email ya está registrado") || 
        errorText.includes("email ya existe") ||
        errorText.includes("usuario ya existe")) {
      return "Este email ya está registrado. ¿Quieres iniciar sesión?";
    }
    if (errorText.includes("Email inválido") || errorText.includes("email inválido")) {
      return "El formato del email no es válido.";
    }
    if (errorText.includes("contraseña debe tener al menos 6 caracteres")) {
      return "La contraseña debe tener al menos 6 caracteres.";
    }
    if (errorText.includes("Error en el servidor") || errorText.includes("500")) {
      return "Hubo un problema con el servidor. Intenta de nuevo más tarde.";
    }
    if (errorText.includes("red") || errorText.includes("conexión") || errorText.includes("fetch")) {
      return "Error de conexión. Verifica tu internet e intenta nuevamente.";
    }
    // Si el mensaje viene vacío o es genérico, mostrar mensaje por defecto
    if (!errorText || errorText === "Error en el registro" || errorText.length < 3) {
      return "Hubo un problema al crear tu cuenta. Intenta nuevamente.";
    }
    return errorText;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setErrors({});
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }

    try {
      await register.mutateAsync({ 
        email, 
        password, 
        name: name.trim() || undefined 
      });
      // El toast de éxito se maneja en el hook
      router.push("/");
    } catch (err: unknown) {
      let message = "Error en el registro";
      
      // Extraer mensaje de error de manera más robusta
      if (err instanceof Error) {
        message = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        message = String(err.message);
      } else if (typeof err === 'string') {
        message = err;
      }
      
      const friendlyMessage = getErrorMessage(message);
      setErrors({ general: friendlyMessage });
      toast.error(friendlyMessage);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Registrarse</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nombre (opcional)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={register.isPending}
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              disabled={register.isPending}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Contraseña"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              disabled={register.isPending}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined });
                }
              }}
              disabled={register.isPending}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {register.isPending ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-green-600 hover:text-green-800 font-medium">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
