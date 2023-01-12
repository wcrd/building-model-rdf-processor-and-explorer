<h1>TTL Model Enhancer</h1>
<div>
    <h2>Upload TTL Model</h2>
    
    <label for="ttl-upload">Upload file:</label>
    <input 
        type="file"
        id="ttl-upload"
        name="ttl-upload"
        accept=".ttl"
        bind:files
    >
    <p>{files}</p>
</div>


<script>
	import N3 from 'n3'
	import { update_graph_with_root_parents } from '$lib/root_parents.js'
	import { ttl_loader } from '$lib/ttl_loader.js'
	import { update_graph_with_full_entity_path } from '$lib/entity_path.js'
	import { generate_trees } from '$lib/tree_builder.js'

	import { entity_subjects } from '$lib/stores/EntityListStore'
		
    let files;
    let store = new N3.Store();

    $: if (files) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList
		const file = files[0]

		// I can't figure out streams, just going to load le data.
		// Use N3
		// ttl_loader(file, store)
		// 	.then(() => console.log("Loaded.", store))
		// 	.then(() => update_graph_with_root_parents(store))
		// 	.then(() => update_graph_with_full_entity_path({n3_store: store, sep: "</>"}))
		// 	.then((quads) => console.log("New path quads: ", quads))
		load_and_enrich_and_make_tree(file);
    }

	// // Generate PREFIX block
	// let prefix_block = ''
	// for (let key in prefixes) {
	// 	prefix_block += `PREFIX ${key}: <${prefixes[key].replace(/.$/,"")}#>\n`
	// }

	async function load_and_enrich_and_make_tree(file){
		await ttl_loader(file, store);
		console.log("Loaded. ", store)
		await update_graph_with_root_parents(store);
		const quads = await update_graph_with_full_entity_path({n3_store: store, sep: "</>"});
		console.log("New path quads: ", quads)
		generate_trees(store)
	}
</script>