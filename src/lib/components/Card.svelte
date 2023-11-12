<script lang="ts">
    export let title = '';
</script>

<div class="bg-white rounded-lg shadow w-full md:mt-0 xl:p-0">
    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        {#if title}
            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">{title}</h1>
        {/if}

        <slot />
    </div>
</div>
