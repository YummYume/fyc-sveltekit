<script context="module" lang="ts">
  // Types
  export type Message = {
    content: string;
    role: 'user' | 'assistant';
  };

  export type CarlosStatus = 'available' | 'thinking' | 'answering';

  // Constants
  export const STATUS_MESSAGE = {
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

  import Close from '$lib/svg/Close.svelte';
  import Refresh from '$lib/svg/Refresh.svelte';
  import Send from '$lib/svg/Send.svelte';
  import { prefersReducedMotion } from '$lib/utils/preferences';
  import { requestAnimationFrame } from '$lib/utils/request-animation-frame';
  import { toasts } from '$lib/utils/toats';

  import Card from './Card.svelte';

  import type { ChatCompletionChunk } from 'openai/resources/index.mjs';

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
      prompt: $page.data.carlosContext?.prompt ?? $page.error?.carlosContext?.prompt,
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
    class="absolute bottom-0 max-w-xl w-[calc(100vw-1.25rem)]"
    transition:fly={{ duration: prefersReducedMotion() ? 0 : 1000, y: 575, easing: bounceOut }}
  >
    <Card
      containerClass="border-2 border-primary-700"
      innerContainerClass="sm:min-h-[50vh] min-h-[55vh] flex flex-col"
    >
      {@const carlosHasContext =
        $page.data.carlosContext?.prompt || $page.error?.carlosContext?.prompt}

      <div class="flex justify-between items-start">
        <div class="grid sm:flex gap-2.5 items-center">
          <enhanced:img
            src="$lib/assets/carlos.png"
            alt="Assistant personnel Carlos"
            class="rounded-full h-10 w-10 lg:h-20 lg:w-20"
          />
          <div class="flex gap-1 items-center">
            <div class="h-3 w-3 bg-primary-700 rounded-full shadow" />

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
        <div class="flex gap-2.5">
          {#if messages.length > 0}
            <button
              aria-label="Supprimer les messages"
              type="button"
              disabled={carlosStatus !== 'available'}
              class="btn | p-2.5"
              aria-controls="message-container"
              on:click={clearMessages}
            >
              <Refresh aria-hidden="true" />
            </button>
          {/if}

          <button
            type="button"
            aria-label="Fermer la discussion"
            on:click={() => {
              dispatch('close');
            }}
          >
            <Close aria-hidden="true" class="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      <div
        class="
          max-h-[40vh] sm:max-h-[33vh] overflow-auto sm:p-1 p-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary-700
          scrollbar-thumb-rounded-full scrollbar-track-rounded-full flex-grow
        "
      >
        {#if messages.length === 0}
          <div
            class="mb-3 text-gray-500 sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col gap-2"
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
                class="rounded-lg px-4 py-2.5"
                class:bg-primary-700={message.role === 'user'}
                class:font-medium={message.role === 'user'}
                class:text-white={message.role === 'user'}
                class:bg-gray-200={message.role === 'assistant'}
              >
                <p id={messageId}>
                  {message.content}
                </p>
              </div>
            </li>
          {/each}
        </ul>
      </div>
      <form class="form" on:submit|preventDefault={handleFormSubmit}>
        <div>
          <label class="text-sm font-medium text-gray-900" for="carlos-question">
            {#if messages.length > 0 && messages.some((message) => message.role === 'user')}
              Ma réponse
            {:else}
              Ma question
            {/if}
          </label>
          <div class="relative">
            <input
              class="!p-4 !pr-14 border-primary-700"
              id="carlos-question"
              maxlength="255"
              name="question"
              required
              type="text"
              aria-describedby={carlosHasContext ? 'carlos-help' : undefined}
              bind:this={chatInput}
              bind:value={inputValue}
            />
            <button
              aria-controls="message-container"
              aria-label="Envoyer"
              class="btn | p-2.5 absolute end-2.5 bottom-2.5"
              disabled={carlosStatus !== 'available' || inputValue.trim() === ''}
              type="submit"
            >
              <Send aria-hidden="true" />
            </button>
          </div>
        </div>
      </form>
      {#if carlosHasContext}
        <p class="text-xs text-gray-500" id="carlos-help">
          Carlos a accès à cette page et peut vous aider à trouver ce que vous cherchez.
        </p>
      {/if}
    </Card>
  </div>
{/if}
