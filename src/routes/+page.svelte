
<div class="container pt-5 mx-auto px-2 h-screen flex flex-col">
	<div id="headings">
		<h1 class="text-xl font-semibold">Buildings TTL Model Tooling <span class="italic font-normal text-base">(for Brick/RealEstateCore models <a href="https://building-ontology-browser.web.app" target="_blank"><span class="mgc_external_link_line"></span></a>)</span></h1>
		<h6 class="text-lg">Enhancement, tree views, reporting, and validation.</h6>
	</div>
	<hr class="my-2">
	<div id="upload-control" class="flex flex-row flex-nowrap w-full border rounded-md border-slate-200 px-1 py-2">
		<div class="flex flex-row w-1/3 items-center">
			<div class="flex-initial flex">
				<label for="ttl-upload" class="font-semibold italic w-max pr-2">Upload TTL file: </label>
			</div>
			<div class="w-full">
				<input 
					type="file"
					id="ttl-upload"
					name="ttl-upload"
					accept=".ttl"
					bind:files={$state.fileList}
					class="w-full"
				/>
			</div>
		</div>
		<div class="flex flex-row flex-nowrap w-2/3 justify-end pr-1 items-center">
			<p class="font-semibold italic pr-2 flex shrink-0">Current Loaded File:</p>
			<p class="overflow-x-auto">{$state.fileList?.length>0 ? $state.fileList[0].name : "none"}</p>
		</div>
	</div>
	<div id="control-bar" class="flex flex-row mt-2 gap-x-1 justify-between">
		<div>
			{#if !$state.processing}
				<button
					on:click={handleProcessClick}
					class="border rounded-md border-blue-800 p-1 bg-blue-500 text-white font-bold"
				>Process Model</button>
			{:else}
				<button class="border rounded-md border-blue-800 p-1 bg-gray-200 text-white font-bold cursor-progress">Processing...</button>
			{/if}
			{#if !$state.validating && $state.processed}
				<button
					on:click={handleValidateClick}
					class="border rounded-md border-teal-800 p-1 bg-teal-500 text-white font-bold"
				>Validate Model</button>
			{:else if $state.validating}
				<button class="border rounded-md border-blue-800 p-1 bg-gray-200 text-white font-bold cursor-progress">Validating...</button>
			{:else}
				<button class="border rounded-md border-blue-800 p-1 bg-slate-500 text-white font-bold cursor-not-allowed" title="Process model first.">Validate</button>

			{/if}
			<span>|</span>
			<a href="./reports/model-report" class="border rounded-md border-teal-800 p-1 bg-indigo-400 text-white italic inline-block">📄 Model Report</a>
			<button class="border rounded-md border-teal-800 p-1 bg-indigo-400 text-white italic cursor-not-allowed" title="This functionality is under development">📄 Validation Report</button>
			<span>|</span>
			<a href={example_model} download class="border rounded-md border-teal-800 p-1 bg-slate-200 text-slate-700 inline-block">📥 Example Model</a>
		</div>
		<div>
			{#if !$state.processed}
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
	// Loading
	import { ttl_loader } from '$lib/js/processing/ttl_loader.js'
	// Processing
	import { update_graph_with_root_parents } from '$lib/js/processing/root_parents.js'
	import { update_graph_with_full_entity_path } from '$lib/js/processing/entity_path.js'
	import { update_graph_with_metering_path } from '$lib/js/processing/metering_path.js'
	import { generate_trees, generate_meter_trees } from '$lib/js/processing/tree_builder.js'
	// Validating
	import { validate } from '$lib/js/validating/max_set_validation.js'
	// Helpers
	import { logger } from '$lib/js/helpers.js'

	// Svelte: Stores
	import { entity_subjects } from '$lib/stores/EntityListStore'
	import { state } from '$lib/stores/AppStateStore'
	import { validation_data, validation_state } from '$lib/stores/ValidationStore'

	// Svelte: Components
	import Console from '$lib/components/Console.svelte'

	// Svelte
	import { onMount } from 'svelte'

	// Static Asset
	import example_model from "$lib/data/example_model/20230103_131314_B_example_simple_model.ttl"

	// CONSTS
	const LOGGER_LEVEL = "debug"

	async function handleProcessClick(){
		if(!$state.fileList){
			logger("No file provided.")
			return false
		}
		// processing_model = true
		$state.processing = true
		$state.processed = await load_and_enrich_and_make_tree($state.fileList[0])
		$state.processing = false
		return true
	}

	async function handleValidateClick(){
		if (!$state.processed){
			logger("Please upload and process a model before running validation.")
			return false
		}
		$state.validating = true;
		$state.validated = await validate_model($state.n3_store);
		$state.validating = false;
		// debug
		// console.log($validation_data)
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
		try {
			logger(null, {level: 'production', mode: 'reset'})
			await ttl_loader(file, $state.n3_store);
			// console.log("Loaded. ", store)
			logger("Loaded. ", LOGGER_LEVEL)
			await update_graph_with_root_parents($state.n3_store);
			let quads = await update_graph_with_full_entity_path({n3_store: $state.n3_store, sep: "</>"});
			// console.log("New path quads: ", quads)
			quads = await update_graph_with_metering_path({n3_store: $state.n3_store, sep: "</>"});
			// console.log("New Metering Paths: ", quads) 
			await generate_trees($state.n3_store)
			await generate_meter_trees($state.n3_store)
			// console.log("Processing complete.")
			logger("Processing complete. Click view model to browse graph...", LOGGER_LEVEL)
			// TESTING - REMOVE THIS WHEN DONE
			// let test_msg_id = logger({msg_base: "My first fancy message", msg_dynamic: "I hope this works", state: "pending"}, {node_type: "fancy"})
			// await new Promise(done => setTimeout(() => done(), 1000));
			// logger({state: "success"}, {node_type: "fancy", mode: 'update', node_id: test_msg_id})
			return true
		} catch {
			logger('Processing encountered a problem and had to abort. Please check console for more detail.')
			return false
		}
	}

	async function validate_model(n3_store){
		try {
			await validate(n3_store)
			$validation_state.data.points = true;
			return true
		} catch {
			logger('Validation encountered a problem and had to abort. Please check console for more detail.')
			return false
		}
	}

	// on Mount print instructions
	onMount(async () => {
		
		// check if already run
		if ($state.instructions) { return }
		// else lets do this
		let msg_id = logger({msg_base: "##### INSTRUCTIONS #####", state: 'pending' }, {node_type: "fancy"})
		const instructions = [
			"To get started, upload your building TTL model",
			"Don't worry, everything is browser based and your model never leaves your computer",
			"If you don't have a TTL model you can download and use our example one linked above ⬆",
			"===================",
			"Once you have uploaded a model, click the 'Process Model' button to process your model and enable the View and Model Report features!",
			"To see the validation columns populated click the 'Validate' button after processing the model. You can come back to this page at anytime to run validation.",
			"##### ##### ##### ######",
		]

		await ArrayPrintTimer(instructions, logger, 300)
		logger({state: 'success' }, {node_type: "fancy", mode: 'update', node_id: msg_id})
		$state.instructions = true
	})

	async function ArrayPrintTimer(array, delegate, delay){
		for (const el of array){
			delegate(el)
			await timeout(delay)
		}
	}

	function timeout(ms) {
    	return new Promise(resolve => setTimeout(resolve, ms));
	}

</script>