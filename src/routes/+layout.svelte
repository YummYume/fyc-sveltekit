<script>
	import '../app.postcss';

	import { enhance } from '$app/forms';

	export let data;
</script>

<div class="flex justify-between w-screen p-4">
	<h1 class="text-xl">CookConnect</h1>

	<div>
		{#if data.user}
			<a href="/account">{data.user.username}</a>
			<form method="POST" action="/?/logout" use:enhance>
				<button type="submit">Logout</button>
			</form>
		{:else}
			<a href="/login">Login</a>
			<a href="/register">Register</a>
		{/if}
	</div>
</div>

<slot />
