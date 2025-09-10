// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast"; // ✅ librería para toasts

const queryClient = new QueryClient();

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {/* toaster global (aparece arriba a la derecha por defecto) */}
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
