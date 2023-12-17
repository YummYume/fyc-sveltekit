<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';

  import Close from '$lib/svg/Close.svelte';
  import { modalControls } from '$lib/utils/modal';
  import { prefersReducedMotion } from '$lib/utils/preferences';

  export let open = false;
  export let id: string | undefined = undefined;
  export let title: string | undefined = undefined;
  export let description: string | undefined = undefined;
  export let hideDescription = false;
  export let withCloseButton = true;

  const dispatch = createEventDispatcher();

  $: titleId = id ? `modal-title-${id}` : undefined;
  $: descriptionId = id ? `modal-description-${id}` : undefined;
</script>

{#if open}
  <div
    {id}
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
    aria-describedby={descriptionId}
    class="modal"
    use:modalControls={{ open, onClose: () => dispatch('close') }}
    transition:fade={{ duration: prefersReducedMotion() ? 0 : 300, easing: cubicOut }}
  >
    <div class="modal__overlay" aria-hidden="true" on:click={() => dispatch('close')}></div>

    <div
      class="modal__content"
      transition:fly|global={{
        y: 100,
        duration: prefersReducedMotion() ? 0 : 300,
        easing: cubicOut,
      }}
    >
      <slot name="close-button">
        {#if withCloseButton}
          <button
            type="button"
            class="modal__close"
            aria-label="Fermer"
            on:click={() => {
              dispatch('close');
            }}
          >
            <Close aria-hidden="true" />
          </button>
        {/if}
      </slot>

      <slot name="title">
        {#if title}
          <h2 id={titleId} class="modal__title">{title}</h2>
        {/if}
      </slot>

      <slot name="description">
        {#if description}
          <p id={descriptionId} class="modal__description" class:sr-only={hideDescription}>
            {description}
          </p>
        {/if}
      </slot>

      <slot />
    </div>
  </div>
{/if}
