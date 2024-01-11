<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import Microphone from '$lib/svg/Microphone.svelte';
  import MicrophoneFull from '$lib/svg/MicrophoneFull.svelte';
  import Search from '$lib/svg/Search.svelte';
  import { createSpeechRecognition } from '$lib/utils/speech';
  import { toasts } from '$lib/utils/toats';

  export let value = '';
  export let disabled = false;

  let form: HTMLFormElement | null = null;
  let input: HTMLInputElement | null = null;
  let recognition: ReturnType<typeof createSpeechRecognition> = null;
  let recognitionStarted = false;
  let recognitionAborted = false;

  const startOrStopRecognition = () => {
    if (recognition) {
      if (recognitionStarted) {
        recognitionAborted = true;

        recognition.stop();

        return;
      }

      recognition.start();

      return;
    }

    toasts.error('Votre navigateur ne supporte pas la reconnaissance vocale.');
  };

  onMount(() => {
    recognition = createSpeechRecognition();

    if (!recognition) {
      return;
    }

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'fr-FR';

    recognition.onstart = () => {
      recognitionStarted = true;
      recognitionAborted = false;
    };

    recognition.onend = () => {
      recognitionStarted = false;

      if (!recognitionAborted) {
        if (form && input && input.value.trim() !== '') {
          form.requestSubmit();
        }

        return;
      }

      recognitionAborted = false;
    };

    recognition.onresult = (event) => {
      if (!input || !recognitionStarted) {
        return;
      }

      const { transcript } = event.results[0][0];

      if (!transcript || transcript.trim() === '') {
        return;
      }

      input.value = transcript.trim();

      const { isFinal } = event.results[0];

      if (!isFinal) {
        return;
      }

      if (recognition && isFinal) {
        recognition.stop();
      }
    };
  });

  onDestroy(() => {
    if (recognition) {
      recognition.abort();
    }
  });
</script>

<form
  action="/search"
  method="GET"
  class="form"
  bind:this={form}
  on:submit={(e) => {
    if (disabled) {
      e.preventDefault();
    }
  }}
>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      <Search class="h-4 w-4 text-gray-500" aria-hidden="true" />
    </div>
    <input
      type="search"
      id="q"
      name="q"
      placeholder="Poulet-frites, Raclette, Pizza, Repas de Noël..."
      required
      aria-label="Rechercher un plat"
      aria-describedby="search-help"
      class="!p-4 !pl-10 !pr-[10.5rem]"
      bind:this={input}
      {value}
    />
    <p class="sr-only" id="search-help">
      Votre recherche peut également contenir une demande, comme par exemple "Repas de Noël sans
      gluten".
    </p>
    <button
      type="button"
      class="btn | absolute right-[7.75rem] top-1/2 -translate-y-1/2 p-2"
      class:bg-primary-800={recognitionStarted}
      class:ring-4={recognitionStarted}
      class:ring-primary-300={recognitionStarted}
      aria-label={recognitionStarted
        ? 'Arrêter la reconnaissance vocale'
        : 'Démarrer la reconnaissance vocale'}
      aria-controls="q"
      on:click={startOrStopRecognition}
    >
      {#if recognitionStarted}
        <MicrophoneFull class="w-5 h-5" aria-hidden="true" />
      {:else}
        <Microphone class="w-5 h-5" aria-hidden="true" />
      {/if}
    </button>
    <button
      type="submit"
      class="btn | absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 w-fit"
      disabled={disabled || recognitionStarted}
    >
      Rechercher
    </button>
  </div>
</form>
