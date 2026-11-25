import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AdminLayout from "../components/layouts/AdminLayout";
import BurocrataLayout from "../components/layouts/BurocrataLayout";
import MetahumanoLayout from "../components/layouts/MetahumanoLayout";
import UserLayout from "../components/layouts/UserLayout";

vi.mock("../components/footer", () => ({
  default: () => <div data-testid="mock-footer">Footer</div>,
}));

const renderLayout = (LayoutComponent, props = {}, authOverrides = {}) => {
  const authValue = {
    isAuthenticated: true,
    logout: vi.fn().mockResolvedValue(undefined),
    user: { id: 1, role: "ADMIN" },
    ...authOverrides,
  };

  return render(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <LayoutComponent {...props}>
          <div>Contenido de prueba</div>
        </LayoutComponent>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe("RoleLayout y variantes por rol", () => {
  it("AdminLayout renderiza estilos, logo e ítems de administrador", () => {
    const { container } = renderLayout(AdminLayout);

    expect(container.firstChild).toHaveClass("bg-[#0f172a]");
    expect(screen.getByAltText("Logo El Súper Gestor")).toHaveAttribute(
      "src",
      "/Images/Admin.png"
    );
    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Gestionar Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Gestionar Metahumanos")).toBeInTheDocument();
    expect(screen.getByText("Gestionar Burócratas")).toBeInTheDocument();
    expect(screen.getByText("Tramites")).toBeInTheDocument();
    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
    expect(screen.getByText("Soporte")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });

  it("BurocrataLayout renderiza estilos, logo e ítems de burócrata", () => {
    const { container } = renderLayout(BurocrataLayout);

    expect(container.firstChild).toHaveClass("bg-[#c4a783]");
    expect(screen.getByAltText("Logo El Súper Gestor")).toHaveAttribute(
      "src",
      "/Images/burocrataLogo.png"
    );
    expect(screen.getByText("Carpetas")).toBeInTheDocument();
    expect(screen.getByText("Vigilar el Mundo")).toBeInTheDocument();
    expect(screen.getByText("Noticias")).toBeInTheDocument();
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
  });

  it("MetahumanoLayout renderiza estilos, logo, ítems y soporta hideFooter y fullScreen", () => {
    const { container } = renderLayout(MetahumanoLayout, {
      hideFooter: true,
      fullScreen: true,
    });

    expect(container.firstChild).toHaveClass("bg-[#296588]", "h-screen", "overflow-hidden");
    expect(screen.getByAltText("Logo El Súper Gestor MetaHumano")).toHaveAttribute(
      "src",
      "/Images/metahumano.png"
    );
    expect(screen.getByText("Tramites")).toBeInTheDocument();
    expect(screen.getByText("Usuario")).toBeInTheDocument();
    expect(screen.getByText("Vigilar el Mundo")).toBeInTheDocument();
    expect(screen.getByText("Noticias")).toBeInTheDocument();
    expect(screen.queryByTestId("mock-footer")).not.toBeInTheDocument();
  });

  it("UserLayout muestra Iniciar Sesión sin autenticación y Cerrar Sesión con autenticación", () => {
    const { container, unmount } = renderLayout(
      UserLayout,
      {},
      { isAuthenticated: false, user: null }
    );

    expect(container.firstChild).toHaveClass("bg-[#262837]");
    expect(screen.getByAltText("Logo El Súper Gestor")).toHaveAttribute("src", "/Logo.png");
    expect(screen.getByText("Iniciar Sesión")).toBeInTheDocument();
    expect(screen.queryByText("Cerrar Sesión")).not.toBeInTheDocument();

    unmount();

    renderLayout(UserLayout, {}, { isAuthenticated: true });
    expect(screen.getByText("Cerrar Sesión")).toBeInTheDocument();
  });

  it("El botón de menú móvil abre y cierra el sidebar sin botón de usuario sin uso", () => {
    renderLayout(AdminLayout);

    const openBtn = screen.getByRole("button", { name: "Abrir menú" });
    fireEvent.click(openBtn);

    expect(screen.getByRole("button", { name: "Cerrar menú" })).toBeInTheDocument();
  });
});
