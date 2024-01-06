<script lang="ts">
  import { blur } from 'svelte/transition';

  import Card from '$lib/components/Card.svelte';
  import { prefersReducedMotion } from '$lib/utils/preferences';

  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1 class="h1">Profil</h1>

<div class="container grid mx-auto gap-x-6 gap-y-8 px-3 py-8 md:grid-cols-2">
  <Card>
    <h2 class="h2">Informations</h2>
    <table class="w-full text-sm text-left text-gray-500">
      <tbody>
        <tr class="border-b">
          <th class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap" scope="row">
            Nom d'utilisateur
          </th>
          <td class="px-4 py-3 flex items-center justify-end">{data.user.username}</td>
        </tr>

        <tr>
          <th class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap" scope="row">
            Ingrédients à éviter
          </th>
          {#key data.user.disallowedIngredients}
            <td
              class="px-4 py-3 flex items-center justify-end"
              in:blur={{ duration: prefersReducedMotion() ? 0 : 250 }}
            >
              {#if data.user.disallowedIngredients}
                <ul class="list-disc list-inside">
                  {#each data.user.disallowedIngredients.split(',') as ingredient}
                    <li>
                      {ingredient}
                    </li>
                  {/each}
                </ul>
              {:else}
                <span>Aucun</span>
              {/if}
            </td>
          {/key}
        </tr>
      </tbody>
    </table>
  </Card>
  <Card>
    <h2 class="h2">Editer le profil</h2>
    <form method="POST" class="form">
      <div>
        <label for="username">Votre nom d'utilisateur</label>
        <input
          type="text"
          name="username"
          id="username"
          value={data.user.username}
          required
          aria-describedby="username-help"
        />
        <p id="username-help" class="text-sm text-gray-500 mt-0.5 ml-0.5">
          Votre nom d'utilisateur doit être unique.
        </p>
      </div>
      <hr />
      <div>
        <label for="disallowed-ingredients">Ingrédients à éviter</label>
        <input
          type="text"
          name="disallowedIngredients"
          id="disallowed-ingredients"
          placeholder="arachides, viande, lait, etc."
          value={data.user.disallowedIngredients ?? ''}
          aria-describedby="disallowed-ingredients-help"
        />
        <p id="disallowed-ingredients-help" class="text-sm text-gray-500 mt-0.5 ml-0.5">
          Séparez les ingrédients par une virgule. Ces ingrédients seront pris en compte lors de la
          proposition de recettes similaires ou d'accompagnements personnalisés. Il vous sera
          également indiqué si un de ces ingrédients est présent dans une recette.
        </p>
      </div>
      <button type="submit" class="btn | xl:w-max">Sauvegarder</button>
    </form>
  </Card>
</div>
