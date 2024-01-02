import type { PageServerLoad } from './$types';
import type { Recipe } from '@prisma/client';

export const load = (async ({ parent }) => {
  const { recipe } = await parent();

  return {
    recipe,
    similarRecipes: [] as Recipe[],
  };
}) satisfies PageServerLoad;
