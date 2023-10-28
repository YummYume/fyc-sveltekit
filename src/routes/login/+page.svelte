<script lang="ts">
    import { enhance } from '$app/forms';
    import type { ActionData } from './$types';

    export let form: ActionData;
</script>

<h1>Login</h1>

<form class="flex flex-col gap-2" method="POST" action="?/login" use:enhance>
    {#if form?.error}
        <p class="text-red-600">{form.error}</p>
    {/if}

	<label>
		<span>Username</span>
		<input name="username" type="text">
	</label>
	<label>
		<span>Password</span>
		<input name="password" type="password">
	</label>
	<button type="submit">Login</button>
</form>
