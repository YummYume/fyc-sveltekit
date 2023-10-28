import type { LayoutServerLoad } from './$types';

export const load = (({ locals }) => {
  return {
    user: locals.session?.user,
  };
}) satisfies LayoutServerLoad;
