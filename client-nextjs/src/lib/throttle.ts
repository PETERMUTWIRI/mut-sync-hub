const store = new Map<string, number>();
export async function throttleKey(key: string, ms: number): Promise<boolean> {
  const now = Date.now();
  const prev = store.get(key) ?? 0;
  if (now - prev < ms) return true; // still throttled
  store.set(key, now);
  return false; // allowed
}
