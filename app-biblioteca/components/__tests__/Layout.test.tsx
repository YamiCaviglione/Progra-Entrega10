import { render, screen } from "@testing-library/react";
import Layout from "../Layout";
import { describe, it, expect } from "vitest";

describe("Layout", () => {
  it("muestra Header y Footer alrededor del contenido", () => {
    render(
      <Layout>
        <p>Contenido de prueba</p>
      </Layout>
    );

    expect(screen.getByText("📚 Libroteca")).toBeInTheDocument(); // Header
    expect(screen.getByText(/libroteca - progra iv/i)).toBeInTheDocument(); // Footer
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });
});
