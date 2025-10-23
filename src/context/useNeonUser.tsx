// useNeonUser removed — use the /api/org-profile endpoint (fetch('/api/org-profile')) instead.
export function useNeonUser(): never {
  throw new Error('useNeonUser has been removed. Use the org-profile API or new auth helpers instead.');
}