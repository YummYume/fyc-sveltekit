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

export const openai = new OpenAI({
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
  If you cannot find a recipe, output "null" and ignore the rest of my message.
  Otherwise give me recipe, and format your output in JSON like this:
  {
    "description": string,
    "dish": string,
    "ingredients": string[],
    "slug": string,
    "steps": string[]
  }
`;

export const getRecipe = (storedRecipes: StoredRecipe[]) => `
  From now on, you are my personnal cooking assistant.
  This is a list of allowed cooking recipes in a JSON format: "${JSON.stringify(storedRecipes)}",
  if the list is empty output this JSON: {"recipe": null, "suggestions": []} and ignore the rest of the message,
  otherwise, I will request you a specific thing to eat, and you will give me a cooking recipe for it, but only if you find the cooking recipe in the list I gave you.
  Output in JSON the recipe with suggestions of similar recipes like this:
  {
    "recipe": {"dish": string, "slug": slug}|null,
    "suggestions": {"dish": string, "slug": slug}[],
  }
`;

// export const getRecipe = (storedRecipes: StoredRecipe[]) => `
//   From now you are now my personnal cooking assistant.
//   My business is to advice people on what to cook.
//   This is the allowed list of cooking recipes in a JSON format: ${JSON.stringify(storedRecipes)}.
//   One of my client will ask you for something to cook, it's important that you only give him the corresponding cooking recipe if it is in the allowed list of cooking recipes,
//   and all the suggestions of every similar cooking recipes only if they are in the allowed list, output a JSON like this:
//   {
//     "recipe": {"dish": string, "slug": slug}|null,
//     "suggestions": {"dish": string, "slug": slug}[],
//   }
// `;
