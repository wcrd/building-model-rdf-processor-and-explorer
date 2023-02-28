<div class="w-full flex flex-row">
    <div class="mr-4"><p>{msg_base}</p></div>
    <div class="flex flex-row"><p class="mr-1">{msg_dynamic}</p><span><ProgressElement {state}/></span></div>
</div>

<script>
    export let state;
    export let msg_base = "Fancy message";
    export let msg_dynamic="I am loading";

    import ProgressElement from "$lib/components/ProgressElement.svelte";
</script>