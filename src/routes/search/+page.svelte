<script lang="ts">
    import type { PageData } from './$types';

    export let data: PageData;

    const getSlug = (str: string) => {
        return str
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]+/g, '');
    };
</script>

<h1 class="h1">Recherche</h1>

{#await data.streamed.result}
    <p>chargement...</p>
{:then value}
    <p>{value.choices[0].message.content}</p>
    <form method="GET" action="/recipe">
        <input type="text" name="dish" value={getSlug(data.streamed.dish)} class="hidden" />
        <button type="submit" class="btn">Générer la recette</button>
    </form>
{/await}
