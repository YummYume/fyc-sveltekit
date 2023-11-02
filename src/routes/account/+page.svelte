<script lang="ts">
    import type { ActionData, PageData } from './$types';

    export let data: PageData;
</script>

<h1>My account ({data.user.username})</h1>
