import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (({ locals }) => {
  const { session } = locals;

  if (!session) {
    throw redirect(303, '/login');
  }

  return {
    user: session.user,
  };
}) satisfies PageServerLoad;
