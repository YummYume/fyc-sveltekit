<script>
    import Card from '$lib/components/Card.svelte';
</script>

<svelte:head>
    <title>CookConnect</title>
</svelte:head>

<h1 class="h1">CookConnect</h1>
<div class="section">
    <Card>
        <form action="/search" class="form">
            <label for="q">Votre recherche</label>
            <input id="q" name="q" />
        </form>
    </Card>
</div>
