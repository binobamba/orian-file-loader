import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">Page non trouvée</h2>
        <p className="text-gray-500 mb-8">La page que vous recherchez n'existe pas.</p>
        <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}