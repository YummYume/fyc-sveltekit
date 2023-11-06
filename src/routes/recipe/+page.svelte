<script lang="ts">
    import type { PageData } from './$types';

    export let data: PageData;
</script>

{#await data.streamed.result}
    <span>loading...</span>
{:then value}
    <span>{value.choices[0].message.content}</span>
{/await}
