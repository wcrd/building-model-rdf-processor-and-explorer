<div id="console-container" class="h-full pb-5 flex flex-col overflow-hidden">
    {#key $console_store}
    <div use:insertElements id="console" class="border rounded-md bg-gray-100 p-1 overflow-y-scroll h-full max-h-[48rem]">
        <p class='font-semibold italic text-gray-300'>Console log...</p>
        <!-- {#each $console_store as node} -->
        <!-- {@html node.outerHTML} -->
        <!-- {/each} -->
    </div>
    {/key}
</div>

<script>
    import { console_store } from '$lib/stores/ConsoleStore'

    function insertElements(target){
        for(let node of $console_store){
            target.appendChild(node)
            node.scrollIntoView(false)
        }
    }
</script>
