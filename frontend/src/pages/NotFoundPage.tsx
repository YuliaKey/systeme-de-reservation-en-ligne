import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Page introuvable
          </h2>
          <p className="text-gray-600">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn-primary">
            <Home className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
          <Link to="/rooms" className="btn btn-secondary">
            <Search className="h-4 w-4 mr-2" />
            Voir les salles disponibles
          </Link>
        </div>
      </div>
    </div>
  );
}
