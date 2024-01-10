<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import Search from '$lib/svg/Search.svelte';
  import { createSpeechRecognition } from '$lib/utils/speech';

  export let value = '';
  export let disabled = false;

  let form: HTMLFormElement | null = null;
  let recognition: ReturnType<typeof createSpeechRecognition> = null;
  let recognitionStarted = false;

  const startRecognition = () => {
    if (recognition) {
      recognition.start();
    }
  };

  onMount(() => {
    recognition = createSpeechRecognition();

    if (!recognition) {
      return;
    }

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'fr-FR';

    recognition.onaudiostart = (e) => {
      console.log('onaudiostart', e);
    };

    recognition.onaudioend = (e) => {
      console.log('onaudioend', e);
    };

    recognition.onsoundstart = (e) => {
      console.log('onsoundstart', e);
    };

    recognition.onsoundend = (e) => {
      console.log('onsoundend', e);
    };

    recognition.onstart = () => {
      disabled = true;
      recognitionStarted = true;
    };

    recognition.onend = () => {
      disabled = false;
      recognitionStarted = false;
    };

    recognition.onresult = (event) => {
      console.log('event', event);
      const { transcript } = event.results[0][0];

      if (!transcript || transcript.trim() === '') {
        return;
      }

      value = `${value} ${transcript}`.trim();

      if (recognition) {
        recognition.stop();
      }

      // if (form) {
      //   form.requestSubmit();
      // }
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
      class="!p-4 !pl-10 !pr-32"
      {value}
    />
    <button type="button" on:click={startRecognition} disabled={disabled || recognitionStarted}>
      Speech {#if recognitionStarted}(on){/if}
    </button>
    <p class="sr-only" id="search-help">
      Votre recherche peut également contenir une demande, comme par exemple "Repas de Noël sans
      gluten".
    </p>
    <button type="submit" class="btn | absolute right-2.5 bottom-2.5 px-4 py-2 w-fit" {disabled}>
      Rechercher
    </button>
  </div>
</form>
