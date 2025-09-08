// pages/login.tsx
// Página de login que usa useLogin (React Query)
import { useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login.mutateAsync({ email, password });
      // si todo OK, useLogin invalida currentUser → redirijo
      router.push("/");
    } catch (err: any) {
      setErrorMsg(err?.message || "Error en login");
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded shadow">
        <h1 className="text-2xl mb-4">Iniciar sesión</h1>

        <form onSubmit={onSubmit} className="space-y-4">
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
            disabled={login.isPending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {login.isPending ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
