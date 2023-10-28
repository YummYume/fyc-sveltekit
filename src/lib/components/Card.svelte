<script>
    export let title = '';
</script>

<div class="w-full bg-white rounded-lg shadow md:mt-0 sm:w-[28rem] xl:p-0">
    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        {#if title}
            <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">{title}</h1>
        {/if}

        <slot />
    </div>
</div>
