<script>
  import { fly, slide } from 'svelte/transition';
  import { diffDescription } from './_diff';

  export let id;
  export let image;
  export let data;
  export let fade = false;
  export let order = undefined;

  const name = data.name;

  const hasBuff = data.descriptionBuff !== undefined;
  let showBuff = hasBuff;

  let description = '';
  $: {
    const rawDescription = showBuff && hasBuff ? data.descriptionBuff : data.description;
    description = rawDescription.replace(/·/g, '- ');
  }

  let diffOrigin = '';
  let diffBuffed = '';
  let diffProcessed = false;

  $: if (hasBuff && !showBuff && !diffProcessed) {
    const { original, buffed } = diffDescription(data.description, data.descriptionBuff);
    diffOrigin = original.replace(/·/g, '- ');
    diffBuffed = buffed.replace(/·/g, '- ');
    diffProcessed = true;
  }
</script>

<div
  class="py-4 rounded-xl bg-item flex flex-col mb-2 whitespace-pre-wrap"
  style="{fade ? 'filter: grayscale(30%);' : ''} {order !== undefined ? `order: ${order};` : ''}"
  id={name}
>
  <div class="flex items-start px-4">
    <img src="/images/skills/{id}/{image}.png" alt={name} class="w-16 h-16 mr-4" />
    <div class="flex flex-col">
      <p class="font-black font-display text-xl">{name}</p>
      <div class="grid pb-4">
        {#if !hasBuff || showBuff}
          <p class="skill-description col-start-1 row-start-1" transition:fly={{ y: 200 }}>
            {@html description}
          </p>
        {/if}
        {#if hasBuff && !showBuff}
          <div transition:slide class="col-start-1 row-start-1 flex flex-col gap-2">
            <div class="bg-black/30 p-4 flex flex-col rounded">
              <p class="text-xs text-gray-600 mb-4 uppercase">Original</p>
              <p class="skill-description">{@html diffOrigin}</p>
            </div>
            <div class="bg-black/30 p-4 flex flex-col rounded">
              <p class="text-xs text-gray-600 mb-4 uppercase">Buffed</p>
              <p class="skill-description">{@html diffBuffed}</p>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if hasBuff}
    <div class="flex justify-end px-4">
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
    </div>
  {/if}
</div>
