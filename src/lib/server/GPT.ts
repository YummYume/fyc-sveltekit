import OpenAI from 'openai';

import type { APIPromise } from 'openai/core';
import type { ChatCompletion, ChatCompletionChunk } from 'openai/resources';
import type { Stream } from 'openai/streaming';

type InputsGPT = {
  inputSystem: string;
  inputUser: string;
};

type IsStreaming<T extends boolean> = T extends true ? Stream<ChatCompletionChunk> : ChatCompletion;

type StoredRecipe = {
  id: number;
  name: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function queryGPT<T extends boolean>({ inputSystem, inputUser }: InputsGPT, stream: T): Promise<IsStreaming<T>> {
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
  I will give you a dish name, and you will give me the recipe steps in French.
  If you cannot find a recipe for the dish, or if the dish is not valid, output "null", or else give me the steps in French.
  Format the recipe in json like this:
  {
    description: string,
    dish: string,
    steps: string[]
  }
`;

export const getRecipe = (storedRecipes: StoredRecipe[]) => `
  This is a list of cooking recipes in json format: ${JSON.stringify(storedRecipes)}.
  I will give you a dish name, and you will give me the recipe for it, only if you find it in the list.
  If you cannot find a recipe for the dish, or if the dish is not valid, output "null", or else give me the result with suggestions of similar recipes from the list.
  If the list is empty, set the suggestions array to "[]" and result to "null".
  Format your output in json like this: 
  {
    result: number|null,
    suggestions: number[]
  }
`;
