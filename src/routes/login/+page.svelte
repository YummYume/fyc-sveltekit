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
    <Card title="Se connecter">
        <Form method="POST" action="?/login">
            <div>
                <Label for="username">Nom d'utilisateur</Label>
                <Input type="username" name="username" id="username" placeholder="name@company.com" required={true} />
            </div>
            <div>
                <Label for="password">Mot de passe</Label>
                <Input type="password" name="password" id="password" placeholder="••••••••" required={true} />
            </div>

            {#if form?.error}
                <p class="text-sm font-light text-red-600">{form.error}</p>
            {/if}

            <Button type="submit">Se connecter</Button>
            <p class="text-sm font-light text-gray-500">
                Pas encore de compte ?
                <a href="/register" class="font-medium text-primary-600 hover:underline">S'inscrire</a>
            </p>
        </Form>
    </Card>
</Section>
