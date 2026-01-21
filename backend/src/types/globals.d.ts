import "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string | null;
        sessionId: string | null;
        sessionClaims: Record<string, unknown> | null;
        orgId: string | null;
        orgRole: string | null;
        orgSlug: string | null;
        getToken: (options?: { template?: string }) => Promise<string | null>;
      };
    }
  }
}
