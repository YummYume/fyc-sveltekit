import { prisma } from '@lucia-auth/adapter-prisma';
import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';

import { db } from './db';

import { dev } from '$app/environment';

export const auth = lucia({
  env: dev ? 'DEV' : 'PROD',
  middleware: sveltekit(),
  adapter: prisma(db, {
    user: 'user',
    key: 'userKey',
    session: 'session',
  }),
  sessionCookie: {
    expires: false,
  },
  getUserAttributes: (data) => {
    return {
      username: data.username,
      disallowedIngredients: data.disallowedIngredients,
    };
  },
});

export type Auth = typeof auth;
