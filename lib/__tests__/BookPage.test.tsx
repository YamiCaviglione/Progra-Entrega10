// lib/__tests__/BookPage.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BookPage from "../../pages/books/[id].tsx";
import { Book } from "../../types";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock del router de Next.js para que no rompa con router.back()
vi.mock("next/router", () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
}));

// Mock de useCurrentUser para que no falle
vi.mock("../../hooks/useCurrentUser", () => ({
  useCurrentUser: () => ({ data: null, isLoading: false })
}));

// Mock de los otros hooks para que no fallen
vi.mock("../../hooks/useReviews", () => ({
  useReviews: () => ({ 
    reviews: [], 
    createReview: { mutate: vi.fn() },
    updateReview: { mutate: vi.fn() },
    deleteReview: { mutate: vi.fn() }
  })
}));

vi.mock("../../hooks/useVotes", () => ({
  useVotes: () => ({ 
    counts: { positive: 0, negative: 0 },
    createVote: { mutate: vi.fn() }
  })
}));

vi.mock("../../hooks/useFavorites", () => ({
  useFavorites: () => ({ 
    favorites: [], 
    addFavorite: { mutate: vi.fn() },
    removeFavorite: { mutate: vi.fn() }
  })
}));

// Crear un QueryClient para los tests
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Datos de prueba del libro
const mockBook: Book = {
  id: "123",
  title: "Libro de prueba",
  authors: ["Autor 1"],
  description: "Descripción del libro",
  image: "/no-image.png",
  publishedDate: "2025",
  pageCount: 200,
  categories: ["Test"],
};

describe("BookPage reseñas", () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  it("muestra mensaje de login cuando usuario no está logueado", () => {
    render(<BookPage book={mockBook} />, { wrapper: createWrapper() });
    expect(
      screen.getByText(/debes iniciar sesión para dejar una reseña/i)
    ).toBeInTheDocument();
  });

  it("muestra título y datos del libro correctamente", () => {
    render(<BookPage book={mockBook} />, { wrapper: createWrapper() });
    
    expect(screen.getByText("Libro de prueba")).toBeInTheDocument();
    expect(screen.getByText("Autor 1")).toBeInTheDocument();
    expect(screen.getByText("Descripción del libro")).toBeInTheDocument();
    expect(screen.getByText(/páginas: 200/i)).toBeInTheDocument();
  });

  it("muestra botón de volver atrás", () => {
    render(<BookPage book={mockBook} />, { wrapper: createWrapper() });
    
    expect(screen.getByText("← Volver atrás")).toBeInTheDocument();
  });

});
