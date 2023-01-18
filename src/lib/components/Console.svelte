<div id="console-container h-full">
    <div id="console" class="my-2 border rounded-md bg-gray-100 p-1 overflow-y-scroll flex flex-col">
        <p class='font-semibold italic text-gray-300'>Console log...</p>
        {#each $console_store as node}
        {@html node.outerHTML}
        {/each}
    </div>
</div>

<script>
    import { console_store } from '$lib/stores/ConsoleStore'
</script>
