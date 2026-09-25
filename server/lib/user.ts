export const userSelect = { id: true, name: true, email: true, role: true, initials: true, status: true } as const;

// Strips password/internal fields from a full BrainUser row before it ever reaches a response body.
export function publicUser<T extends Record<string, unknown>>(user: T): Omit<T, "passwordHash" | "createdAt"> {
  const { passwordHash: _passwordHash, createdAt: _createdAt, ...rest } = user;
  return rest;
}
