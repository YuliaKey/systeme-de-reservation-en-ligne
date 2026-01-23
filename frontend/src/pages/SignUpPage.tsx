import { SignUp } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useCurrentUser } from "../hooks";

export function SignUpPage() {
  const { isSignedIn } = useAuth();
  const { isAdmin, isLoading } = useCurrentUser();

  if (isSignedIn && !isLoading) {
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Créer un compte
          </h1>
          <p className="text-gray-600">
            Rejoignez-nous pour réserver vos salles facilement
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-xl",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
}
