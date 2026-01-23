import { Link, Navigate } from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Package, Calendar, Shield, Zap, Bell, Lock } from "lucide-react";
import { useCurrentUser } from "../hooks";

export function HomePage() {
  const { isAdmin, isLoading } = useCurrentUser();

  // Rediriger les admins vers /admin
  if (!isLoading && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const features = [
    {
      icon: Calendar,
      title: "Réservation simple",
      description: "Réservez vos salles de réunion en quelques clics",
    },
    {
      icon: Bell,
      title: "Notifications email",
      description: "Recevez des confirmations et rappels automatiques",
    },
    {
      icon: Shield,
      title: "Sécurisé",
      description: "Authentification sécurisée et données protégées",
    },
    {
      icon: Zap,
      title: "Disponibilité temps réel",
      description: "Consultez la disponibilité des salles instantanément",
    },
    {
      icon: Lock,
      title: "Pas de conflits",
      description: "Système intelligent qui évite les doubles réservations",
    },
    {
      icon: Package,
      title: "Salles variées",
      description: "Petites, moyennes et grandes salles selon vos besoins",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Réservez vos salles
            <span className="text-primary-600"> en un clic</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plateforme intuitive pour réserver vos salles de réunion.
            Vérification instantanée des disponibilités et notifications
            automatiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <Link to="/sign-in" className="btn btn-primary btn-lg">
                Commencer gratuitement
              </Link>
              <a href="#features" className="btn btn-secondary btn-lg">
                En savoir plus
              </a>
            </SignedOut>
            <SignedIn>
              <Link
                to={isAdmin ? "/admin" : "/dashboard"}
                className="btn btn-primary btn-lg"
              >
                {isAdmin ? "Administration" : "Mon tableau de bord"}
              </Link>
              <Link to="/rooms" className="btn btn-secondary btn-lg">
                Voir les salles
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pourquoi choisir notre plateforme ?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tout ce qu'il vous faut pour réserver vos salles de réunion
            facilement
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <SignedOut>
        <div className="bg-primary-600 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à réserver votre salle ?
            </h2>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              Créez votre compte et réservez votre première salle de réunion en
              moins de 2 minutes
            </p>
            <Link
              to="/sign-in"
              className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
            >
              Commencer maintenant
            </Link>
          </div>
        </div>
      </SignedOut>
    </div>
  );
}
