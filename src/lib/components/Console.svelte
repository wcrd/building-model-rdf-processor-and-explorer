<div id="console-container" class="h-full pb-5">
    <div id="console" class="border rounded-md bg-gray-100 p-1 overflow-y-scroll flex flex-col h-full max-h-[48rem]">
        <p class='font-semibold italic text-gray-300'>Console log...</p>
        {#each $console_store as node}
        {@html node.outerHTML}
        {/each}
    </div>
</div>

<script>
    import { console_store } from '$lib/stores/ConsoleStore'
</script>
