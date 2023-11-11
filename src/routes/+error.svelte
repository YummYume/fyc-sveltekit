<script lang="ts">
  import { page } from '$app/stores';
</script>

<section>
  <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
    <div class="mx-auto max-w-screen-sm text-center">
      <h1 class="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600">
        {$page.status}
      </h1>
      <p class="mb-4 text-lg font-light text-gray-500">
        {$page.error?.message}
      </p>
      <a
        href="/"
        class="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center my-4"
      >
        Retour à l'accueil
      </a>
    </div>
  </div>
</section>
