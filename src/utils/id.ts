/**
 * Collision-resistant unique ID generator for frontend entities.
 * Combines crypto.randomUUID (with standard fallback) for demonstration safety.
 */
export function generateId(prefix: string = ''): string {
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return prefix ? `${prefix}-${rand}` : rand;
}
