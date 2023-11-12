<script lang="ts">
  import { onDestroy } from 'svelte';
  import { bounceOut } from 'svelte/easing';
  import { blur, fade, fly, scale } from 'svelte/transition';

  import { prefersReducedMotion } from '$lib/utils/preferences';
  import { requestAnimationFrame } from '$lib/utils/request-animation-frame';

  import Card from './Card.svelte';

  import type { ChatCompletionChunk } from 'openai/resources';

  // Types
  type Message = {
    content: string;
    role: 'user' | 'assistant';
  };

  type ChunkReader = (reader: ReadableStreamDefaultReader<Uint8Array>) => Promise<void>;

  // Constants
  const decoder = new TextDecoder('utf-8');

  // Variables
  let open = false;
  let disabled = false;
  let chatInput: HTMLInputElement | null = null;
  let messages: Message[] = [];
  let messageContainer: HTMLUListElement | null = null;
  let abortController: AbortController | null = null;

  // Handle the chunks of the response body
  const handleMessageChunk: ChunkReader = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
  ) => {
    const chunk = await reader.read();

    if (chunk.done || abortController?.signal.aborted) {
      return Promise.resolve();
    }

    const message = decoder.decode(chunk.value, { stream: true });
    // Split the message into lines
    const lines = message.split(/}\n/g).filter((line) => line.trim() !== '');
    const chatCompletions: ChatCompletionChunk[] = JSON.parse(`[${lines.join('},')}}]`);
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

      // Start the transition
      messages = newMessages;
    }

    // Add the new message to the last one
    lastMessage.content = chatCompletions.reduce((currentMessage, chatCompletion) => {
      if (chatCompletion.choices.length === 0) {
        return currentMessage;
      }

      // Take the first choice
      const choice = chatCompletion.choices[0];

      if (choice.finish_reason !== null) {
        return currentMessage;
      }

      // Append the choice to the current message (only if valid)
      return `${currentMessage}${choice.delta.content}`;
    }, lastMessage.content);

    newMessages.push(lastMessage);

    // Replace the last message with the new one
    messages = newMessages;

    return handleMessageChunk(reader);
  };

  const handleFormSubmit = async (event: SubmitEvent) => {
    if (disabled) {
      return;
    }

    disabled = true;

    const formData = new FormData(event.target as HTMLFormElement);
    const question = formData.get('question');

    if (typeof question !== 'string' || question.trim() === '') {
      // TODO: handle error

      disabled = false;

      return;
    }

    if (chatInput) {
      chatInput.value = '';
    }

    messages = [
      ...messages,
      {
        content: question,
        role: 'user',
      },
    ];

    abortController = new AbortController();

    const response = await fetch('/carlos', {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: abortController.signal,
    });

    if (!response.ok || !response.body) {
      console.error('Carlos is not available...', response);

      // TODO: handle error

      return;
    }

    try {
      const reader = response.body.getReader();

      await handleMessageChunk(reader);
    } catch (error) {
      console.error('Carlos is not available...', error);

      // TODO: handle error
    }

    abortController = null;
    disabled = false;
  };

  // Lifecycle
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

<div class="bottom-0 left-0 p-2.5 fixed lg:p-5">
  <div class="relative">
    {#if !open}
      <button
        aria-label="Discuter avec l'assistant personnel"
        aria-haspopup="dialog"
        class="absolute bottom-0 h-10 w-10 sm:h-20 sm:w-20 bg-slate-400 rounded-full"
        on:click={() => {
          open = true;

          requestAnimationFrame(() => {
            if (chatInput) {
              chatInput.focus();
            }
          });
        }}
        transition:blur={{ amount: 10, duration: prefersReducedMotion() ? 0 : 1000 }}
      >
        <enhanced:img
          src="$lib/assets/carlos.png"
          alt="Assistant personnel Carlos"
          class="rounded-full shadow-2xl"
        />
      </button>
    {:else}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Discussion avec l'assistant personnel"
        aria-describedby="carlos-description"
        class="absolute bottom-0 max-w-xl w-screen min-h-[23.5rem]"
        transition:fly={{ duration: prefersReducedMotion() ? 0 : 1000, y: 575, easing: bounceOut }}
      >
        <Card>
          <div class="flex justify-between items-start p-2 space-y-4 md:space-y-6 sm:p-4">
            <div class="flex gap-2 items-center">
              <enhanced:img
                src="$lib/assets/carlos.png"
                alt="Assistant personnel Carlos"
                class="rounded-full h-20 w-20"
              />
              <div class="flex gap-1 items-center">
                <div class="h-3 w-3 bg-green-600 rounded-full shadow" />
                {#key disabled}
                  <p in:fade={{ duration: prefersReducedMotion() ? 0 : 500 }} role="status">
                    {disabled ? 'Carlos est en train de répondre...' : 'Carlos est disponible'}
                  </p>
                {/key}
              </div>
            </div>
            <button
              aria-label="Fermer la discussion"
              on:click={() => {
                open = false;
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
          <div class="max-h-[50vh] overflow-auto">
            <div
              class="max-w-[25ch] mb-3 text-gray-500 sm:max-w-sm md:max-w-md lg:max-w-lg flex flex-col gap-2"
              class:sr-only={messages.length > 0}
              id="carlos-description"
            >
              <p>Bonjour, je suis Carlos de CookConnect, et je suis votre assistant personnel.</p>
              <p>
                Demandez-moi n'importe quoi en rapport avec la cuisine, et je vous aiderai de mon
                mieux!
              </p>
            </div>
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
                  transition:scale={{ duration: prefersReducedMotion() ? 0 : 500 }}
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
          <form class="form" on:submit|preventDefault={handleFormSubmit}>
            <div>
              <label for="question">
                {#if messages.length > 0 && messages.some((message) => message.role === 'user')}
                  Ma réponse
                {:else}
                  Ma question
                {/if}
              </label>
              <div class="gap-3 grid sm:flex">
                <input
                  bind:this={chatInput}
                  type="question"
                  name="question"
                  id="question"
                  maxlength="255"
                  required
                />
                <button
                  type="submit"
                  class="btn | sm:w-fit"
                  aria-controls="message-container"
                  {disabled}
                >
                  Envoyer
                </button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    {/if}
  </div>
</div>
