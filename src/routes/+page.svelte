<script>
  import Card from '$lib/components/Card.svelte';
</script>

<h1 class="h1">CookConnect</h1>
<div class="max-w-xl mx-auto w-full">
  <Card>
    <form action="/search" class="form">
      <input
        aria-label="Rechercher un plat"
        id="q"
        name="q"
        placeholder="ex : Poulet-frites, Raclette, Pizza, etc."
      />
      <button type="submit" class="btn">Rechercher</button>
    </form>
  </Card>
</div>
