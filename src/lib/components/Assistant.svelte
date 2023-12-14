<script context="module" lang="ts">
  // Types
  export type Message = {
    content: string;
    role: 'user' | 'assistant';
  };

  export type CarlosStatus = 'available' | 'thinking' | 'answering';

  // Constants
  export const STATUS_MESSAGE: { [key in CarlosStatus]: string } = {
    available: 'Carlos est disponible',
    thinking: 'Carlos réfléchit...',
    answering: 'Carlos est en train de répondre...',
  } as const;
</script>

<script lang="ts">
  import { Stream } from 'openai/streaming';
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { bounceOut } from 'svelte/easing';
  import { fade, fly, scale } from 'svelte/transition';

  import { prefersReducedMotion } from '$lib/utils/preferences';
  import { requestAnimationFrame } from '$lib/utils/request-animation-frame';
  import { toasts } from '$lib/utils/toats';

  import Card from './Card.svelte';

  import type { ChatCompletionChunk } from 'openai/resources';

  import { page } from '$app/stores';

  // Props
  export let open = false;

  // Constants
  const dispatch = createEventDispatcher();

  // Variables
  let chatInput: HTMLInputElement | null = null;
  let inputValue = '';
  let messages: Message[] = [];
  let messageContainer: HTMLUListElement | null = null;
  let abortController: AbortController | null = null;
  let carlosStatus: CarlosStatus = 'available';

  // Handle the readable stream
  const handleReadableStream = async (
    readableStream: ReadableStream<Uint8Array>,
    controller: AbortController,
  ) => {
    if (controller.signal.aborted || readableStream.locked) {
      return;
    }

    const stream = Stream.fromReadableStream<ChatCompletionChunk>(readableStream, controller);

    // Read the stream chunk by chunk
    for await (const message of stream) {
      const newMessages = [...messages];
      let lastMessage = newMessages.pop();

      // If there is no last message, create one
      if (!lastMessage || lastMessage.role !== 'assistant') {
        if (lastMessage) {
          newMessages.push(lastMessage);
        }

        lastMessage = {
          content: '',
          role: 'assistant',
        };
      }

      // Take the first choice
      const choice = message.choices[0];

      if (choice.finish_reason === null) {
        // Append the choice to the current message (only if valid)
        lastMessage.content += choice.delta.content;

        if (lastMessage.content.trim() !== '') {
          newMessages.push(lastMessage);

          // Replace the last message with the new one
          messages = newMessages;
        }
      }
    }
  };

  // Handle the form submit
  const handleFormSubmit = async (event: SubmitEvent) => {
    if (carlosStatus !== 'available') {
      return;
    }

    carlosStatus = 'thinking';

    const formData = new FormData(event.target as HTMLFormElement);
    const question = formData.get('question');

    if (typeof question !== 'string' || question.trim() === '') {
      toasts.warning(`Veuillez entrer une ${messages.length > 0 ? 'réponse' : 'question'}.`);

      carlosStatus = 'available';

      return;
    }

    if (question.trim().length > 255) {
      toasts.warning('Votre question ne doit pas dépasser 255 caractères.');

      carlosStatus = 'available';

      return;
    }

    inputValue = '';

    messages = [
      ...messages,
      {
        content: question,
        role: 'user',
      },
    ];

    const context = {
      prompt: $page.data.carlosContext?.prompt,
    };

    abortController = new AbortController();

    const response = await fetch('/carlos', {
      method: 'POST',
      body: JSON.stringify({ messages, context }),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
    });

    if (!response.ok || !response.body) {
      toasts.error("Carlos n'est pas disponible. Veuillez réessayer plus tard.");

      abortController = null;
      carlosStatus = 'available';

      return;
    }

    try {
      carlosStatus = 'answering';

      await handleReadableStream(response.body, abortController);
    } catch (error) {
      toasts.error('Carlos a rencontré une erreur. Veuillez réessayer plus tard.');
    }

    abortController = null;
    carlosStatus = 'available';
  };

  // Clear the messages
  const clearMessages = () => {
    if (carlosStatus !== 'available') {
      return;
    }

    messages = [];
  };

  // Lifecycle
  // Focus the chat input when the component is opened
  $: if (open) {
    requestAnimationFrame(() => {
      if (chatInput) {
        chatInput.focus();
      }
    });
  }

  // Scroll to the bottom of the messages container when a new message is added
  $: if (messages.length > 0) {
    requestAnimationFrame(() => {
      if (!messageContainer) {
        return;
      }

      messageContainer.scrollIntoView(false);
    });
  }

  // Abort the request when the component is destroyed
  onDestroy(() => {
    if (abortController) {
      abortController.abort();
    }
  });
</script>

{#if open}
  <div
    role="dialog"
    aria-modal="false"
    aria-label="Discussion avec l'assistant personnel"
    aria-describedby="carlos-description"
    class="absolute bottom-0 max-w-xl w-screen"
    transition:fly={{ duration: prefersReducedMotion() ? 0 : 1000, y: 575, easing: bounceOut }}
  >
    <Card innerContainerClass="min-h-[50vh] flex flex-col">
      <div class="flex justify-between items-start p-2 space-y-4 md:space-y-6 sm:p-4">
        <div class="flex gap-2 items-center">
          <enhanced:img
            src="$lib/assets/carlos.png"
            alt="Assistant personnel Carlos"
            class="rounded-full h-20 w-20"
          />
          <div class="flex gap-1 items-center">
            <div class="h-3 w-3 bg-primary-600 rounded-full shadow" />
            {#key carlosStatus}
              <p
                in:fade={{ duration: prefersReducedMotion() ? 0 : 500 }}
                role="status"
                aria-live="polite"
              >
                {STATUS_MESSAGE[carlosStatus]}
              </p>
            {/key}
          </div>
        </div>
        <button
          type="button"
          aria-label="Fermer la discussion"
          on:click={() => {
            dispatch('close');
          }}
        >
          <svg
            class="w-6 h-6 text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
      <div
        class="max-h-[50vh] overflow-auto sm:p-1 p-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary-600 scrollbar-thumb-rounded-full scrollbar-track-rounded-full flex-grow"
      >
        {#if messages.length === 0}
          <div
            class="max-w-[25ch] mb-3 text-gray-500 sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col gap-2"
            id="carlos-description"
            in:fade={{ duration: prefersReducedMotion() ? 0 : 500 }}
          >
            <p>Bonjour, je suis Carlos de CookConnect, et je suis votre assistant personnel.</p>
            <p>
              Demandez-moi n'importe quoi en rapport avec la cuisine, et je vous aiderai de mon
              mieux!
            </p>
          </div>
        {/if}
        <ul
          id="message-container"
          aria-label="Conversation avec l'assistant personnel"
          role="region"
          aria-live="polite"
          class="flex flex-col gap-2"
          bind:this={messageContainer}
        >
          {#each messages as message, index (index)}
            {@const messageId = `message-${index}`}

            <li
              class:ml-auto={message.role === 'user'}
              class:mr-auto={message.role === 'assistant'}
              class="w-11/12"
              aria-label={message.role === 'user' ? 'Mon message' : 'Message de Carlos'}
              aria-describedby={messageId}
              in:scale={{ duration: prefersReducedMotion() ? 0 : 500 }}
            >
              <div
                class="rounded-lg p-2.5"
                class:bg-gray-100={message.role === 'user'}
                class:bg-gray-200={message.role === 'assistant'}
              >
                <p class="text-gray-800" id={messageId}>
                  {message.content}
                </p>
              </div>
            </li>
          {/each}
        </ul>
      </div>
      {#if messages.length > 0 || $page.data.carlosContext?.prompt}
        <div class="grid grid-cols-2 gap-2">
          <div class="text-sm text-gray-500">
            {#if $page.data.carlosContext?.prompt}
              <p>Carlos a accès à cette page et peut vous aider à trouver ce que vous cherchez.</p>
            {/if}
          </div>
          <div>
            {#if messages.length > 0}
              <button
                type="button"
                disabled={carlosStatus !== 'available'}
                class="btn text-sm"
                aria-controls="message-container"
                on:click={clearMessages}
              >
                Supprimer les messages
              </button>
            {/if}
          </div>
        </div>
      {/if}
      <form class="form" on:submit|preventDefault={handleFormSubmit}>
        <div>
          <label for="carlos-question">
            {#if messages.length > 0 && messages.some((message) => message.role === 'user')}
              Ma réponse
            {:else}
              Ma question
            {/if}
          </label>
          <div class="gap-3 grid sm:flex">
            <input
              bind:this={chatInput}
              bind:value={inputValue}
              type="text"
              name="question"
              id="carlos-question"
              maxlength="255"
              required
            />
            <button
              type="submit"
              class="btn | sm:w-fit disabled:saturate-50 bg-primary-600 enabled:hover:bg-primary-700 disabled:bg-primary-400"
              aria-controls="message-container"
              disabled={carlosStatus !== 'available' || inputValue.trim() === ''}
            >
              Envoyer
            </button>
          </div>
        </div>
      </form>
    </Card>
  </div>
{/if}
