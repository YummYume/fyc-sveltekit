<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import Card from '$lib/components/Card.svelte';
    import Form from '$lib/components/Form.svelte';
    import Input from '$lib/components/Input.svelte';
    import Label from '$lib/components/Label.svelte';
    import Section from '$lib/components/Section.svelte';
    import type { ActionData } from './$types';

    export let form: ActionData;
</script>

<Section>
    <Card title="Créer un compte">
        <Form method="POST" action="?/register">
            <div>
                <Label for="username">Votre nom d'utilisateur</Label>
                <Input type="text" name="username" id="username" placeholder="name@company.com" required={true} />
            </div>
            <div>
                <Label for="password">Mot de passe</Label>
                <Input type="password" name="password" id="password" placeholder="••••••••" required={true} />
            </div>
            <div>
                <Label for="password-repeat">Confirmer le mot de passe</Label>
                <Input type="password" name="password-repeat" id="password-repeat" placeholder="••••••••" required={true} />
            </div>

            {#if form?.error}
                <p class="text-sm font-light text-red-600">{form.error}</p>
            {/if}

            <Button type="submit">Créer un compte</Button>
            <p class="text-sm font-light text-gray-500">
                Déjà membre ?
                <a href="/login" class="font-medium text-primary-600 hover:underline">Se connecter</a>
            </p>
        </Form>
    </Card>
</Section>
