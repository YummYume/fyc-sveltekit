import { json } from '@sveltejs/kit';

import type { RequestHandler } from './$types';

export const GET = (() => {
  return json({
    uptime: process.uptime(),
    message: 'Service is healthy.',
    date: Date.now(),
  });
}) satisfies RequestHandler;
