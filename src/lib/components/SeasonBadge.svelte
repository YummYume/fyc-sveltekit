<script lang="ts">
  import type { Season } from '$lib/utils/date';

  export let season: Season;

  const badgeColorSeason = {
    été: 'badge--green',
    automne: 'badge--orange',
    hiver: 'badge--blue',
    printemps: 'badge--yellow',
  };
</script>

<p class={`badge ${badgeColorSeason[season]}`} {...$$restProps}>
  Résultats organisés selon la saison <span class="font-bold ml-1">{season}</span>
</p>
