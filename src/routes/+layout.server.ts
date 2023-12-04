import type { LayoutServerLoad } from './$types';

export const load = (({ locals }) => {
  return {
    user: locals.session?.user,
    seo: {
      title: 'CookConnect',
      meta: {
        description: 'The CookConnect app.',
      },
    },
  };
}) satisfies LayoutServerLoad;
