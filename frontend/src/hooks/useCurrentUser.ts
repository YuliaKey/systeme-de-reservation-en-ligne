import { useQuery } from "@tanstack/react-query";
import { useUser as useClerkUser } from "@clerk/clerk-react";
import { usersService } from "../services";
import type { User } from "../types";

export function useCurrentUser() {
  const {
    user: clerkUser,
    isLoaded: isClerkLoaded,
    isSignedIn,
  } = useClerkUser();

  const {
    data: dbUser,
    isLoading: isDbUserLoading,
    error,
    refetch,
  } = useQuery<User>({
    queryKey: ["user", "me"],
    queryFn: () => usersService.getMe(),
    enabled: isClerkLoaded && isSignedIn,
    retry: 1,
  });

  return {
    user: dbUser,
    clerkUser,
    isLoading: !isClerkLoaded || isDbUserLoading,
    isSignedIn,
    isAdmin: dbUser?.role === "admin",
    error,
    refetch,
  };
}
