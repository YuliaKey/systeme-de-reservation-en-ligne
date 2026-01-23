import { Link, useLocation, Outlet } from "react-router-dom";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import {
  Building2,
  Calendar,
  History,
  LayoutDashboard,
  Home,
} from "lucide-react";
import { useCurrentUser } from "../hooks";
import { cn } from "../utils";

export function MainLayout() {
  const location = useLocation();
  const { isAdmin } = useCurrentUser();

  const isActive = (path: string) => location.pathname === path;

  const userNavLinks = [
    { path: "/dashboard", label: "Tableau de bord", icon: Home },
    { path: "/rooms", label: "Salles", icon: Building2 },
    { path: "/reservations", label: "Mes réservations", icon: Calendar },
    { path: "/history", label: "Historique", icon: History },
  ];

  const adminNavLinks = [
    { path: "/admin", label: "Administration", icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">MeetSpace</span>
            </Link>

            {/* Navigation */}
            <SignedIn>
              <nav className="hidden md:flex items-center space-x-1">
                {userNavLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive(path)
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700 hover:bg-gray-100",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
                {isAdmin &&
                  adminNavLinks.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={cn(
                        "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive(path)
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  ))}
              </nav>
            </SignedIn>

            {/* User menu */}
            <div className="flex items-center space-x-4">
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                />
              </SignedIn>
              <SignedOut>
                <Link to="/sign-in" className="btn btn-primary">
                  Connexion
                </Link>
              </SignedOut>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <SignedIn>
          <nav className="md:hidden border-t border-gray-200 px-4 py-2">
            <div className="flex space-x-1">
              {userNavLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-xs font-medium transition-colors",
                    isActive(path)
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700",
                  )}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span>{label}</span>
                </Link>
              ))}
              {isAdmin &&
                adminNavLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center py-2 rounded-lg text-xs font-medium transition-colors",
                      isActive(path)
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-700",
                    )}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span>{label}</span>
                  </Link>
                ))}
            </div>
          </nav>
        </SignedIn>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>© 2024 MeetSpace. Tous droits réservés.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/about" className="hover:text-primary-600">
                À propos
              </Link>
              <Link to="/contact" className="hover:text-primary-600">
                Contact
              </Link>
              <Link to="/privacy" className="hover:text-primary-600">
                Confidentialité
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
