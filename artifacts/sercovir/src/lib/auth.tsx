import { useAuth } from "@clerk/react";
import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

export interface AccessUser {
  id: number;
  clerkUserId: string;
  email: string | null;
  displayName: string;
  avatarUrl: string | null;
  role: "OWNER" | "ADMIN" | "MODERATOR" | "STAFF" | "PREMIUM" | "NORMAL";
  clearanceLevel: "CL1" | "CL2" | "CL3" | "CL4" | "CL5";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
}

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type AppAuthState = {
  isLoaded: boolean;
  isSignedIn: boolean;
  hasClerk: boolean;
  userId: string | null;
};

const AppAuthContext = createContext<AppAuthState | null>(null);

export function AppAuthProvider({ value, children }: { value: AppAuthState; children: ReactNode }) {
  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

export function useAppAuth() {
  const value = useContext(AppAuthContext);
  if (!value) throw new Error("useAppAuth must be used within AppAuthProvider");
  return value;
}

export function ClerkAuthBridge({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  return (
    <AppAuthProvider value={{ isLoaded, isSignedIn: Boolean(isSignedIn), hasClerk: true, userId: userId ?? null }}>
      {children}
    </AppAuthProvider>
  );
}

export function useCurrentAccess() {
  const { isSignedIn } = useAppAuth();
  return useQuery<AccessUser>({
    queryKey: ["auth", "me"],
    enabled: Boolean(isSignedIn),
    queryFn: async () => {
      const response = await fetch(`${BASE}/api/auth/me`, { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load account");
      return response.json();
    },
    staleTime: 30_000,
  });
}

export const ROLE_LABELS: Record<AccessUser["role"], string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  STAFF: "Staff",
  PREMIUM: "Premium",
  NORMAL: "Normal",
};

export const CLEARANCE_LABELS: Record<AccessUser["clearanceLevel"], string> = {
  CL1: "CL1 / Top Secret",
  CL2: "CL2 / Secret",
  CL3: "CL3 / Restricted",
  CL4: "CL4 / Controlled",
  CL5: "CL5 / Public",
};

export const canModerate = (role?: AccessUser["role"]) => Boolean(role && ["OWNER", "ADMIN", "MODERATOR", "STAFF"].includes(role));