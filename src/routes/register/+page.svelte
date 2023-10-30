<script lang="ts">
    import type { ActionData } from './$types';

    import { enhance } from '$app/forms';

    export let form: ActionData;
</script>

<h1>Register</h1>

<form class="flex flex-col gap-2" method="POST" action="?/register" use:enhance>
    {#if form?.error}
        <p class="text-red-600">{form.error}</p>
    {/if}

    <label>
        <span>Username</span>
        <input name="username" type="text" />
    </label>
    <label>
        <span>Password</span>
        <input name="password" type="password" />
    </label>
    <label>
        <span>Repeat password</span>
        <input name="password-repeat" type="password" />
    </label>
    <button type="submit">Register</button>
</form>
