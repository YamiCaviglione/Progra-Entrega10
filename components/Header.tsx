// components/Header.tsx
import Link from "next/link";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useLogout } from "../hooks/useLogout";

const Header = () => {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  return (
    <header className="bg-blue-600 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo o nombre de la app */}
        <Link href="/">
          <span className="font-bold text-lg cursor-pointer">📚 Mi Biblioteca</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {/* Mientras carga, podés mostrar "..." */}
          {isLoading && <span>Cargando...</span>}

          {/* Si hay user logueado */}
          {user ? (
            <>
              <span className="font-medium">
                Hola, {user.name || user.email}
              </span>
              <Link href="/favorites" className="hover:underline">
                Mis Favoritos
              </Link>
              <button
                onClick={() => logout.mutate()}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">
                Login
              </Link>
              <Link href="/register" className="hover:underline">
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
