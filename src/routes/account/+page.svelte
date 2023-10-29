<script lang="ts">
    import Card from '$lib/components/Card.svelte';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<div class="container grid mx-auto gap-x-6 gap-y-8 px-3 py-8 md:grid-cols-2">
    <Card>
        <table class="w-full text-sm text-left text-gray-500">
            <tbody>
                <tr class="border-b">
                    <th class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">Adresse e-mail</th>
                    <td class="px-4 py-3 flex items-center justify-end">{data.user.username}</td>
                </tr>
            </tbody>
        </table>
    </Card>
    <Card></Card>
</div>
