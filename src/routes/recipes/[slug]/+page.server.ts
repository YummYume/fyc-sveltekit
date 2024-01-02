import type { PageServerLoad } from './$types';

export const load = (async ({ parent }) => {
  const { recipe } = await parent();

  return {
    recipe,
    isFavourite: false,
  };
}) satisfies PageServerLoad;
