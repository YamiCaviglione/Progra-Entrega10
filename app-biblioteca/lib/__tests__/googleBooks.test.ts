// utils/__tests__/googleBooks.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchBooks, getBookById } from "../../utils/googleBooks";

// Antes de cada test, reseteamos mocks
beforeEach(() => {
  vi.restoreAllMocks();
});

describe("googleBooks utils", () => {
  it("searchBooks devuelve libros correctamente", async () => {
    // Mock de respuesta de fetch
    const mockResponse = {
      items: [
        {
          id: "1",
          volumeInfo: {
            title: "Clean Code",
            authors: ["Robert C. Martin"],
            description: "A book about writing clean code",
            imageLinks: { thumbnail: "http://example.com/clean-code.jpg" },
            publishedDate: "2008",
            pageCount: 464,
            categories: ["Programming"],
          },
        },
      ],
    };

    // Mockeamos fetch
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => mockResponse,
    } as Response);

    const books = await searchBooks("clean code");

    expect(books).toHaveLength(1);
    expect(books[0].id).toBe("1");
    expect(books[0].title).toBe("Clean Code");
    expect(books[0].authors).toContain("Robert C. Martin");
    expect(books[0].image).toBe("http://example.com/clean-code.jpg");
  });

  it("searchBooks devuelve [] si no hay resultados", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => ({}), // sin items
    } as Response);

    const books = await searchBooks("no-results");
    expect(books).toEqual([]);
  });

  it("getBookById devuelve un libro correctamente", async () => {
    const mockResponse = {
      id: "123",
      volumeInfo: {
        title: "The Pragmatic Programmer",
        authors: ["Andrew Hunt", "David Thomas"],
        description: "Classic book on software development",
        imageLinks: { thumbnail: "http://example.com/pragmatic.jpg" },
        publishedDate: "1999",
        pageCount: 352,
        categories: ["Programming"],
      },
    };

    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => mockResponse,
    } as Response);

    const book = await getBookById("123");

    expect(book).not.toBeNull();
    expect(book?.id).toBe("123");
    expect(book?.title).toBe("The Pragmatic Programmer");
    expect(book?.authors).toContain("Andrew Hunt");
    expect(book?.categories).toContain("Programming");
  });

  it("getBookById devuelve null si no encuentra libro", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: async () => null,
    } as Response);

    const book = await getBookById("999");
    expect(book).toBeNull();
  });
});
