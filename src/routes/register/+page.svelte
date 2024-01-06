<script lang="ts">
  import Card from '$lib/components/Card.svelte';
</script>

<section class="section">
  <Card title="Créer un compte">
    <form method="POST" class="form">
      <div>
        <label for="username">Votre nom d'utilisateur</label>
        <input type="text" name="username" id="username" required={true} />
      </div>
      <div>
        <label for="password">Mot de passe</label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="••••••••"
          required={true}
        />
      </div>
      <div>
        <label for="password-repeat">Confirmer le mot de passe</label>
        <input
          type="password"
          name="password-repeat"
          id="password-repeat"
          placeholder="••••••••"
          required={true}
        />
      </div>

      <button class="btn" type="submit">Créer un compte</button>
      <p class="text-sm font-light text-gray-500">
        Déjà membre ?
        <a href="/login" class="font-medium text-primary-600 hover:underline">Se connecter</a>
      </p>
    </form>
  </Card>
</section>
