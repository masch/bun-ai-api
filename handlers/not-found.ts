import type { Context } from 'hono';

export const handleNotFound = (c: Context) => {
  return c.text('Not Found', 404);
};
