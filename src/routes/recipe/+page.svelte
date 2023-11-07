<script lang="ts">
    // export let data: PageData;

    const data = {
        streamed: {
            result: {
                description:
                    'La raclette est un plat traditionnel suisse à base de fromage fondu accompagné de pommes de terre, de cornichons et de charcuterie.',
                dish: 'raclette',
                steps: [
                    "Faites cuire les pommes de terre dans de l'eau salée jusqu'à ce qu'elles soient tendres. Égouttez-les et réservez.",
                    'Coupez le fromage à raclette en tranches fines.',
                    'Disposez les pommes de terre cuites dans une assiette.',
                    'Placez les tranches de fromage dans des poêlons individuels et faites-les fondre sous un gril ou dans un appareil à raclette.',
                    'Une fois le fromage fondu, versez-le sur les pommes de terre.',
                    'Servez la raclette avec des cornichons, des oignons, de la charcuterie et des condiments selon votre goût.',
                    'Dégustez chaud et profitez de ce délicieux plat suisse !',
                ],
            },
        },
    };
</script>

<!-- {#await data.streamed.result}
    <p>chargement...</p>
{:then value}
    <p>{value.choices[0].message.content}</p>
{/await} -->

<div class="flex items-start justify-center">
    <h1 class="capitalize h1">{data.streamed.result.dish}</h1>
    <button>
        <svg class="w-10 h-10 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 20">
            <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m11.479 1.712 2.367 4.8a.532.532 0 0 0 .4.292l5.294.769a.534.534 0 0 1 .3.91l-3.83 3.735a.534.534 0 0 0-.154.473l.9 5.272a.535.535 0 0 1-.775.563l-4.734-2.49a.536.536 0 0 0-.5 0l-4.73 2.487a.534.534 0 0 1-.775-.563l.9-5.272a.534.534 0 0 0-.154-.473L2.158 8.48a.534.534 0 0 1 .3-.911l5.294-.77a.532.532 0 0 0 .4-.292l2.367-4.8a.534.534 0 0 1 .96.004Z"
            />
        </svg>
    </button>
</div>
<div class="container mx-auto">
    <p class="mb-3 text-lg text-gray-500 md:text-xl">{data.streamed.result.description}</p>
    <h2 class="mb-2 text-lg font-semibold text-gray-900">Etapes de la recette</h2>
    <ol class="space-y-1 text-gray-500 list-decimal list-inside">
        {#each data.streamed.result.steps as step}
            <li>
                <span class="font-semibold text-gray-900">{step}</span>
            </li>
        {/each}
    </ol>
</div>
