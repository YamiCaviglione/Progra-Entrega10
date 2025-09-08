// pages/register.tsx
// Página de registro que usa useRegister (React Query)
import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useRegister } from "../hooks/useRegister";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await register.mutateAsync({ email, password, name });
      // onSuccess de useRegister invalida currentUser → usuario queda logueado
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err?.message || "Error en el registro");
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
        <h1 className="text-2xl mb-4">Registrarse</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre (opcional)"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMsg && <p className="text-red-500">{errorMsg}</p>}

          <button
            type="submit"
            disabled={register.isPending}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
          >
            {register.isPending ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
