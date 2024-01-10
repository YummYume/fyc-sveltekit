<script lang="ts">
  import { getCurrentSeason } from '$lib/utils/date';

  const season = getCurrentSeason();
  const badgeColorSeason = {
    été: 'badge__green',
    automne: 'badge__orange',
    hiver: 'badge__blue',
    printemps: 'badge__yellow',
  };
</script>

<span class={`badge ${badgeColorSeason[season]}`}>{season}</span>
