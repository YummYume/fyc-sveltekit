import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load = (({ locals }) => {
  const user = locals.session?.user;

  if (!user) {
    throw redirect(303, '/login');
  }

  return {
    user,
  };
}) satisfies PageServerLoad;
