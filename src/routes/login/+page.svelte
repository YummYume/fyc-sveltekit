<script lang="ts">
    import Card from '$lib/components/Card.svelte';

    import type { ActionData } from './$types';

    import { enhance } from '$app/forms';

    export let form: ActionData;
</script>

<section class="section">
    <Card title="Se connecter">
        <form method="POST" action="?/login" class="form" use:enhance>
            <div>
                <label for="username">Nom d'utilisateur</label>
                <input type="username" name="username" id="username" required={true} />
            </div>
            <div>
                <label for="password">Mot de passe</label>
                <input type="password" name="password" id="password" placeholder="••••••••" required={true} />
            </div>

            {#if form?.error}
                <p class="text-sm font-light text-red-600">{form.error}</p>
            {/if}

            <button class="btn" type="submit">Se connecter</button>
            <p class="text-sm font-light text-gray-500">
                Pas encore de compte ?
                <a href="/register" class="font-medium text-primary-600 hover:underline">S'inscrire</a>
            </p>
        </form>
    </Card>
</section>
