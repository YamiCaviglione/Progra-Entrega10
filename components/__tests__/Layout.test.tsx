import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import Layout from "../Layout";
import { describe, it, expect } from "vitest";

// Mock del router de Next.js para useLogout
vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: "/",
  }),
}));

// Mock de useCurrentUser para que no falle
vi.mock("../../hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ data: null, isLoading: false })
}));

// Crear un QueryClient para los tests
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
  
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
}

describe("Layout", () => {
  it("muestra Header y Footer alrededor del contenido", () => {
    render(
      <Layout>
        <p>Contenido de prueba</p>
      </Layout>,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Libroteca")).toBeInTheDocument(); // Header
    expect(screen.getByText(/libroteca - progra iv/i)).toBeInTheDocument(); // Footer
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });
});
