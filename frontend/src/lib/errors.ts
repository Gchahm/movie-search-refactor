export function hasMessage(err: unknown): err is { message: string } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'message' in (err as Record<string, unknown>) &&
    typeof (err as { message?: unknown }).message === 'string'
  );
}

export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (hasMessage(err)) return err.message;
  if (typeof err === 'string') return err;
  try {
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}

export function isAbortError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const obj = err as Record<string, unknown>;
  const name = typeof obj.name === 'string' ? obj.name : undefined;
  const code = typeof obj.code === 'string' ? obj.code : undefined;
  return name === 'AbortError' || code === 'AbortError';
}
