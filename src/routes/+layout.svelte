<script>
    import Form from '$lib/components/Form.svelte';
    import UserCircle from '$lib/svg/UserCircle.svelte';
    import '../app.postcss';

    export let data;
</script>

<header>
    <nav class="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
        <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <a
                href="/"
                class="
					text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-bold rounded-lg text-xl
					px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none
				"
            >
                CookConnect
            </a>

            {#if data.user}
                <div class="flex items-center lg:order-2">
                    <Form method="POST" action="/?/logout">
                        <button
                            type="submit"
                            class="
								text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium
								rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none
							"
                        >
                            Se déconnecter
                        </button>
                    </Form>
                    <a href="/account">
                        <UserCircle />
                    </a>
                </div>
            {/if}
        </div>
    </nav>
</header>
<main class="flex flex-col grow">
    <slot />
</main>
