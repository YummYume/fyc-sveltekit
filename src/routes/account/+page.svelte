<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import { toasts } from '$lib/utils/toats';

  import type { ActionData, PageData } from './$types';

  import { enhance } from '$app/forms';

  export let data: PageData;
  export let form: ActionData;

  $: if (form?.error) {
    toasts.error(form.error);
  }
</script>

<h1 class="h1">Profil</h1>
<div class="container grid mx-auto gap-x-6 gap-y-8 px-3 py-8 md:grid-cols-2">
  <Card>
    <h2 class="h2">Informations</h2>
    <table class="w-full text-sm text-left text-gray-500">
      <tbody>
        <tr class="border-b">
          <th class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">Nom d'utilisateur</th>
          <td class="px-4 py-3 flex items-center justify-end">{data.user.username}</td>
        </tr>
      </tbody>
    </table>
  </Card>
  <Card>
    <h2 class="h2">Editer le profil</h2>
    <form
      method="POST"
      class="form"
      use:enhance={() => {
        return async ({ update, result }) => {
          await update({ reset: false });

          if (result.type === 'success') {
            toasts.success('Profil mis à jour.');
          }
        };
      }}
    >
      <div>
        <label for="username">Votre nom d'utilisateur</label>
        <input type="text" name="username" id="username" value={data.user.username} required />
      </div>
      <hr />
      <div>
        <label for="disallowedIngredients">Ingrédients à ne pas utiliser</label>
        <input
          type="text"
          name="disallowedIngredients"
          id="disallowedIngredients"
          placeholder="arachides, viande, lait, etc."
          value={data.user.disallowedIngredients ?? ''}
        />
      </div>
      <button type="submit" class="btn | xl:w-max">Sauvegarder</button>
    </form>
  </Card>
</div>
