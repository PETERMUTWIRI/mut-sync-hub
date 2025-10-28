// AuthContext removed — use /api/org-profile or the new client-side fetch helpers instead.
// This stub throws if used so imports fail fast during testing.

export function useAuth(): never {
  throw new Error('useAuth has been removed. Use fetch("/api/org-profile") or the new auth helpers instead.');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = () => {
  throw new Error('AuthProvider has been removed. Use the org-profile API and top-level providers instead.');
};
