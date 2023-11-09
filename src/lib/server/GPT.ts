import OpenAI from 'openai';

import type { APIPromise } from 'openai/core';
import type { ChatCompletion, ChatCompletionChunk } from 'openai/resources';
import type { Stream } from 'openai/streaming';

import { OPENAI_API_KEY } from '$env/static/private';

type InputsGPT = {
  inputSystem: string;
  inputUser: string;
};

type IsStreaming<T extends boolean> = T extends true ? Stream<ChatCompletionChunk> : ChatCompletion;

type StoredRecipe = {
  dish: string;
  slug: string;
};

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function queryGPT<T extends boolean>(
  { inputSystem, inputUser }: InputsGPT,
  stream: T,
): Promise<IsStreaming<T>> {
  return openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream,
    messages: [
      {
        role: 'system',
        content: inputSystem,
      },
      {
        role: 'user',
        content: inputUser,
      },
    ],
  }) as APIPromise<IsStreaming<T>>;
}

export const MAKE_RECIPE = `
  I will give you a prompt, and you will give me a cooking recipe for it in French.
  If you cannot find a recipe, or if the prompt is not valid, output "null", otherwise give me recipe.
  Format your output in json like this:
  {
    "description": string,
    "dish": string,
    "ingredients": string[],
    "steps": string[]
  }
`;

export const getRecipe = (storedRecipes: StoredRecipe[]) => `
  This is a list of cooking recipes in json format: "${JSON.stringify(storedRecipes)}".
  Ignore any data that is not from the list I gave you.
  If the list is empty, output this json: {"recipe": null, "suggestions": []} and ignore the rest of the prompt.
  Otherwise, I will give you a cooking related prompt, and you will give me a cooking recipe for it.
  If the prompt is not related to cooking, output "null",
  otherwise, output the recipe with suggestions of similar recipes, like this: 
  {
    "recipe": {"dish": string, "slug": slug}|null,
    "suggestions": {"dish": string, "slug": slug}[],
  }
  The "recipe" property is containing the recipe id or null,
  and the "suggestions" property is containing an id array of suggested recipes.
`;
