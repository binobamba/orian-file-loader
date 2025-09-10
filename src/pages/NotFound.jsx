import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-900">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-white">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page non trouvée</h2>
        <p className="text-white mb-8">La page que vous recherchez n'existe pas.</p>
        <Link to="/" className="bg-gradient-to-r from-green-500 to-orange-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-600 transition-colors duration-200">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}