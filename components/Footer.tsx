//components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-blue-800 text-white mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <p className="text-sm">© {new Date().getFullYear()} Libroteca  -  Progra IV </p>
        <p className="text-sm">Desarrollado con Next.js :)</p>
      </div>
    </footer>
  );
}
