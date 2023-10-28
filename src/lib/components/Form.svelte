<script>
    import { enhance } from '$app/forms';
</script>

<form class="space-y-4 md:space-y-6" {...$$restProps} use:enhance>
    <slot />
</form>
