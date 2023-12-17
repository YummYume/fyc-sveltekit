<script lang="ts">
  import Spinner from '$lib/svg/Spinner.svelte';

  export let message = 'Chargement...';
</script>

<div class="flex flex-col gap-1 items-center justify-center w-full" {...$$restProps}>
  <slot name="icon">
    <Spinner size="h-8 w-8" color="text-primary-600" />
  </slot>
  <slot>
    <p role="status" class="text-gray-500 text-center">{message}</p>
  </slot>
</div>
