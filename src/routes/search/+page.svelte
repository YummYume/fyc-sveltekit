<script lang="ts">
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<h1>Search</h1>

{#await data.streamd.result}
    <span>loading...</span>
{:then value}
    <span>{value.choices[0].message.content}</span>
{/await}
