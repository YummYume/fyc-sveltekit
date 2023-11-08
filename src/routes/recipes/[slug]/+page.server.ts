import type { PageServerLoad } from '../../$types.js';

export const load = (async ({ locals, url }) => {
  const { db } = locals;

  const dish = (url.searchParams.get('slug') ?? '') as string;

  return {
    streamed: {
      recipe: await db.recipe.findUnique({
        where: {
          slug: dish,
        },
      }),
    },
  };
}) satisfies PageServerLoad;

export const actions = {
  // favourite: async ({ locals, request }) => {
  //   const { db, session } = locals;
  //   const { dish } = (await request.formData()).get('recipe');
  //   const favourite = await db.favourite.create({
  //     data: {
  //       users: {
  //         connect: [{ id: session?.userId }],
  //       },
  //       recipes: {
  //         connect: [{ slug: dish }],
  //       },
  //     },
  //   });
  // },
};
