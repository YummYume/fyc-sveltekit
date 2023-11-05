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
  id: string;
  name: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

export const generateRecipe = `I will give you a dish name 
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

export const foundARecipe = (storedRecipes: StoredRecipe[]) => `I will give you a recipe name,
if not, output 'null'.
If input isn't a recipe name or not an existing recipe, output 'null'.
iF the input is just a color, output 'null'.
Ignore anything that is not a recipe.
This is a list of cooking recipes in json format: ${JSON.stringify(storedRecipes)}.
If you found in the list, a recipe for the recipe I gave you, give me the result with id's suggestions of similar recipes from the list only.
If the list is empty just set suggestions array to [] and result to null, and
format everything in json like this: 
{
  result: id|null
  suggestions: id[]
}`;
