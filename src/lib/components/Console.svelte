<div id="console-container" class="flex flex-col overflow-hidden h-full">
    <!-- {#key $console_store} -->
    <!-- <div use:insertElements id="console" class="border rounded-md bg-gray-100 p-1 overflow-y-scroll h-full max-h-[48rem]">
        <p class='font-semibold italic text-gray-300'>Console log...</p>
    </div> -->
    <div id="console" class="border rounded-md bg-gray-100 p-1 overflow-y-scroll h-full max-h-[48rem]">
        <p class='font-semibold italic text-gray-300'>Console log...</p>
        {#each $console_store as consoleMsg (consoleMsg.id)}
        <div use:scrollToThis>
            {#if consoleMsg.node_type == "simple"}
            <p>{consoleMsg.params}</p>
            {:else if typeof consoleMsg.params == "string"}
            <p>{JSON.stringify(consoleMsg)}</p>
            {:else if consoleMsg.node_type == "fancy"}
            <FancyMessage {...consoleMsg.params}/>
            <!-- <p>{JSON.stringify(consoleMsg)}</p> -->
            {/if}
        </div>
        {/each}
    </div>
    <!-- {/key} -->
    <footer class="my-1 text-slate-200 text-center">wcrd.</footer>
</div>

<script>
    import { console_store } from '$lib/stores/ConsoleStore'
    import FancyMessage from '$lib/components/console/FancyMessage.svelte';

    function scrollToThis(node){
        node.scrollIntoView()
    }

</script>
