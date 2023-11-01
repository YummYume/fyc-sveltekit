<script lang="ts">
    import { enhance } from '$app/forms';
    import { bounceOut } from 'svelte/easing';
    import { blur, fly } from 'svelte/transition';
    import Card from './Card.svelte';

    let open = false;
</script>

<div class="bottom-0 left-0 p-2.5 fixed lg:p-5">
    <div class="relative">
        {#if !open}
            <button
                aria-label="Discuter avec l'assistant personnel"
                class="absolute bottom-0 h-10 w-10 sm:h-20 sm:w-20"
                on:click={() => (open = true)}
                transition:blur={{ amount: 10 }}
            >
                <img src="/img/carlos.png" alt="" height="244" width="244" decoding="async" loading="lazy" class="rounded-full shadow-2xl" />
            </button>
        {/if}

        {#if open}
            <div class="absolute bottom-0 !w-fit" transition:fly={{ duration: 1000, y: 600, opacity: 1, easing: bounceOut }}>
                <Card>
                    <div class="flex justify-between items-start">
                        <img src="/img/carlos.png" alt="" height="244" width="244" decoding="async" loading="lazy" class="rounded-full h-20 w-20" />
                        <button aria-label="Fermer la discussion" on:click={() => (open = false)}>
                            <svg class="w-6 h-6 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
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
                    <div class="w-max">
                        <p class="max-w-[25ch] mb-3 text-gray-500 sm:max-w-sm md:max-w-md lg:max-w-lg">
                            Bonjour, je suis Carlos de CookConnect, et je suis votre assistant personnel.
                            <br /><br />
                            Demandez-moi n'importequoi en rapport avec la cuisine, et je vous aiderai de mon mieux !
                        </p>
                    </div>
                    <form method="POST" action="" class="form" use:enhance>
                        <div>
                            <label for="question">Votre question</label>
                            <div class="gap-3 grid sm:flex">
                                <input type="question" name="question" id="question" required={true} />
                                <button type="submit" class="btn | sm:w-fit">Envoyer</button>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        {/if}
    </div>
</div>
