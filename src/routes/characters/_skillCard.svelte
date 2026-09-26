<script>
  import { fly, slide } from 'svelte/transition';
  import { t } from 'svelte-i18n';
  import Icon from '../../components/Icon.svelte';
  import { mdiChevronDown } from '@mdi/js';
  import { diffDescription } from './_diff';

  export let id = '';
  export let image = '';
  export let data = {};
  export let withQuote = false;
  export let withSingleLevel = false;

  const name = data.name;

  const hasBuff = data.descriptionBuff !== undefined;
  let showStat = false;
  let showBuff = hasBuff;

  let iter = [...new Array(withSingleLevel ? 1 : 13)];

  let description = '';
  let quote = '';

  $: {
    const rawDescription = showBuff && hasBuff ? data.descriptionBuff : data.description;
    ({ description, quote } = formatDescription(rawDescription));
  }

  let diffOrigin = '';
  let diffBuffed = '';
  let diffProcessed = false;

  $: if (hasBuff && !showBuff && !diffProcessed) {
    const { original, buffed } = diffDescription(data.description, data.descriptionBuff);
    diffOrigin = formatDescription(original).description;
    diffBuffed = formatDescription(buffed).description;
    diffProcessed = true;
  }

  function formatDescription(desc) {
    const lastIndex = withQuote ? desc.indexOf('<i>') : desc.length;
    const description = desc.substring(0, lastIndex).replace(/·/g, '- ');
    const quote = desc.substring(lastIndex, desc.length).replace('<i>', '').replace('</i>', '').replace(/·/g, '- ');

    return { description, quote };
  }

  const numberFormat1Digit = Intl.NumberFormat('en', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
  const numberFormat2Digit = Intl.NumberFormat('en', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  function formatter(type, number) {
    switch (type) {
      case 'i':
        return Math.round(number);
      case 'p':
        return `${Math.round(number * 100)}%`;
      case '1p':
        return `${numberFormat1Digit.format(number * 100)}%`;
      case '2p':
        return `${numberFormat2Digit.format(number * 100)}%`;
      case '1f':
        return `${numberFormat1Digit.format(number)}`;
      case '2f':
        return `${numberFormat2Digit.format(number)}`;
    }
  }

  function format(str, args) {
    // let formatted = str.replace(/(\/{)|(\+{)|\s[^+]+/g, (token) => ` ${token} `);
    let formatted = str.replace(/[\+\/]{/g, (token) => ` ${token}`);
    formatted = formatted.replace(/{[0-9]:\w+}/g, (text) => {
      const splitted = text.substring(1, text.length - 1).split(':');
      return formatter(splitted[1], args[splitted[0]]);
    });
    return formatted;
  }
</script>

<div class="py-4 rounded-xl bg-item flex flex-col mb-4 whitespace-pre-wrap" id={name}>
  <div class="flex mb-2 items-center px-4">
    <img src="/images/skills/{id}/{image}.png" alt={name} class="w-16 h-16 mr-4" />
    <div>
      <p class="font-black font-display text-xl">{name}</p>
    </div>
  </div>
  <div class="grid">
    {#if !hasBuff || showBuff}
      <p class="skill-description px-4 col-start-1 row-start-1" transition:fly|local={{ y: 200 }}>
        {@html description}
      </p>
    {/if}
    {#if hasBuff && !showBuff}
      <div transition:slide|local class="col-start-1 row-start-1 flex flex-col gap-2">
        <div class="bg-black/30 pt-4 px-4 flex flex-col">
          <p class="text-xs text-gray-600 mb-4 uppercase">Original</p>
          <p class="skill-description">{@html diffOrigin}</p>
        </div>
        <div class="bg-black/30 pt-4 px-4 flex flex-col">
          <p class="text-xs text-gray-600 mb-4 uppercase">Buffed</p>
          <p class="skill-description">{@html diffBuffed}</p>
        </div>
      </div>
    {/if}
  </div>
  {#if withQuote}
    <p class="text-sm text-gray-400 italic mt-2 px-4">{@html quote}</p>
  {/if}
  <div class="flex justify-between items-center px-4 mt-4">
    <button
      class="inline-flex cursor-pointer focus:outline-none"
      on:click={() => {
        showStat = !showStat;
      }}
    >
      Talent Stat <Icon path={mdiChevronDown} className="transform duration-100 {showStat ? 'rotate-180' : ''}" />
    </button>
    {#if hasBuff}
      <button
        class="inline-flex items-center gap-2 cursor-pointer focus:outline-none"
        on:click={() => {
          showBuff = !showBuff;
        }}
      >
        <span class="text-sm">{showBuff ? 'Buffed' : 'Original'}</span>
        <div
          class="relative w-10 h-6 rounded-full transition-colors duration-200 {showBuff
            ? 'bg-primary'
            : 'bg-gray-600'}"
        >
          <div
            class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 {showBuff
              ? 'translate-x-4'
              : 'translate-x-0'}"
          />
        </div>
      </button>
    {/if}
  </div>
  {#if showStat}
    <div transition:slide class="mt-4 block overflow-x-auto">
      <div class="px-4" style="width: fit-content;">
        <div class="table max-w-full rounded-xl border border-gray-200 border-opacity-25">
          <table class="text-gray-200 text-sm">
            <tr>
              <td class="border-gray-700 px-2">{$t('characters.lvl')}</td>
              {#each iter as _, i}
                <td class="text-center border-gray-700 px-2">{i + 1}</td>
              {/each}
            </tr>
            {#if data.skillIndex.length > 0}
              {#each showBuff ? data.skillBuffIndex : data.skillIndex as i}
                <tr>
                  <td class="border-t border-gray-700 px-2" style="min-width: 150px;">{data.skillLabels[i]}</td>
                  {#each data.skillStats[i].slice(0, 13) as stat}
                    <td class="text-center border-t border-gray-700 px-2">
                      {@html format(data.skillStatsLabels[i], stat)}
                    </td>
                  {/each}
                </tr>
              {/each}
            {:else}
              {#each data.skillLabels as label, i}
                <tr>
                  <td class="border-t border-gray-700 px-2" style="min-width: 150px;">{label}</td>
                  {#each data.skillStats[i].slice(0, 13) as stat}
                    <td class="text-center border-t border-gray-700 px-2">
                      {@html format(data.skillStatsLabels[i], stat)}
                    </td>
                  {/each}
                </tr>
              {/each}
            {/if}
          </table>
        </div>
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  td:not(:last-child) {
    @apply border-r;
  }

  :global(span.color) {
    @apply text-primary font-semibold;
  }

  @screen lg {
    ::-webkit-scrollbar {
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      @apply bg-transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.35);
      @apply rounded-xl;
    }
  }
</style>
