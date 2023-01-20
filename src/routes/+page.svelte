
<div class="container pt-5 mx-auto h-screen flex flex-col">
	<div id="headings">
		<h1 class="text-xl font-semibold">TTL Model Tooling</h1>
		<h6 class="text-lg">Enhancement, tree views, reporting, and validation.</h6>
	</div>
	<hr class="my-2">
	<div id="upload-control" class="flex flex-row flex-nowrap w-full border rounded-md border-slate-200 px-1 py-2">
		<div class="flex-initial flex">
			<label for="ttl-upload" class="font-semibold italic w-max pr-2">Upload TTL file: </label>
		</div>
		<div class="w-full">
			<input 
				type="file"
				id="ttl-upload"
				name="ttl-upload"
				accept=".ttl"
				bind:files={$state.file_path}
				class="w-full"
			/>
		</div>
	</div>
	<div id="control-bar" class="flex flex-row mt-2 gap-x-1 justify-between">
		<div>
			{#if !processing_model}
				<button
					on:click={handleProcessClick}
					class="border rounded-md border-blue-800 p-1 bg-blue-500 text-white font-bold"
				>Process Model</button>
			{:else}
				<button class="border rounded-md border-blue-800 p-1 bg-gray-200 text-white font-bold cursor-progress">Processing...</button>
			{/if}
			<button class="border rounded-md border-teal-800 p-1 bg-teal-500 text-white font-bold">Validate Model</button>
		</div>
		<div>
			{#if disable_view_model_link}
				<button type="submit" class="border rounded-md border-sky-800 p-1 bg-slate-500 text-white font-bold cursor-not-allowed" disable title="Process model before viewing" >View Model</button>
			{:else}
				<form action="./tree-viewer">
					<button type="submit" class="border rounded-md border-sky-800 p-1 bg-sky-500 text-white font-bold">View Model</button>
				</form>
			{/if}
		</div>
	</div>
	<hr class="my-2"/>
	<Console></Console>
</div>

<!-- {@debug $state} -->

<script>
	// import N3 from 'n3'
	import { update_graph_with_root_parents } from '$lib/root_parents.js'
	import { ttl_loader } from '$lib/ttl_loader.js'
	import { update_graph_with_full_entity_path } from '$lib/entity_path.js'
	import { generate_trees } from '$lib/tree_builder.js'
	import { logger } from '$lib/helpers.js'

	// import { entity_subjects } from '$lib/stores/EntityListStore'
	import { state } from '$lib/stores/AppStateStore'

	import Console from '$lib/components/Console.svelte'

		
    let files;
    // let store = new N3.Store();

	// UI controllers
	let disable_view_model_link = true; // is the model ready to be viewed
	let processing_model = false;
	let validating_model = false;

	// CONSTS
	const LOGGER_LEVEL = "debug"

	async function handleProcessClick(){
		if(!$state.file_path){
			logger("No file provided.")
			return false
		}
		processing_model = true
		await load_and_enrich_and_make_tree($state.file_path[0])
		processing_model = false
		return true
	}

    // $: if (files) {
	// 	// Note that `files` is of type `FileList`, not an Array:
	// 	// https://developer.mozilla.org/en-US/docs/Web/API/FileList
	// 	const file = files[0]

	// 	// I can't figure out streams, just going to load le data.
	// 	// Use N3
	// 	// ttl_loader(file, store)
	// 	// 	.then(() => console.log("Loaded.", store))
	// 	// 	.then(() => update_graph_with_root_parents(store))
	// 	// 	.then(() => update_graph_with_full_entity_path({n3_store: store, sep: "</>"}))
	// 	// 	.then((quads) => console.log("New path quads: ", quads))
	// 	load_and_enrich_and_make_tree(file)
	// 	console.log(entity_subjects)
    // }

	// // Generate PREFIX block
	// let prefix_block = ''
	// for (let key in prefixes) {
	// 	prefix_block += `PREFIX ${key}: <${prefixes[key].replace(/.$/,"")}#>\n`
	// }

	async function load_and_enrich_and_make_tree(file){
		logger(null, 'production', 'reset')
		await ttl_loader(file, $state.n3_store);
		// console.log("Loaded. ", store)
		logger("Loaded. ", LOGGER_LEVEL)
		await update_graph_with_root_parents($state.n3_store);
		const quads = await update_graph_with_full_entity_path({n3_store: $state.n3_store, sep: "</>"});
		// console.log("New path quads: ", quads)
		await generate_trees($state.n3_store)
		// console.log("Processing complete.")
		logger("Processing complete. Click view model to browse graph...", LOGGER_LEVEL)
		disable_view_model_link = false
		return true
	}



	// function add_to_console_gui(value){
	// 	const p = document.createElement('p')
	// 	p.textContent = value
	// 	console_gui.append(p)
	// 	return
	// }
</script>