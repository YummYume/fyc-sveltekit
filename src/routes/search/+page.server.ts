import { queryGPT } from '$lib/server/GPT';

import type { PageServerLoad } from './$types';

const inputSystem = `I will give you a dish name 
if not output 'null',
ignore anything that is not a dish.
If you cannot find a recipe for the dish, output 'null',
or else ouput the complete step for the recipe, 
and you must translate everything in french and if [json] is present format each steps in json like this
{
  recipe: string
  description: string
  steps: string[]
} 
or if [raw] is present format in plain text with return line`;

export const load = (async ({ url }) => {
  const value = url.searchParams.get('q') ?? '';

  return {
    streamd: {
      result: queryGPT({ inputSystem, inputUser: `[raw] ${value}` }, false),
    },
  };
}) satisfies PageServerLoad;
