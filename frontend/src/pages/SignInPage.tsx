import { SignIn } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useCurrentUser } from "../hooks";

export function SignInPage() {
  const { isSignedIn } = useAuth();
  const { isAdmin, isLoading } = useCurrentUser();

  if (isSignedIn && !isLoading) {
    return <Navigate to={isAdmin ? "/admin" : "/rooms"} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder à votre compte
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
          fallbackRedirectUrl="/rooms"
          signUpUrl="/sign-up"
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  );
}
