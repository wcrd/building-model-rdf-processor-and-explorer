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
		
    let files;
    let store = new N3.Store();

    $: if (files) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList
		const file = files[0]

		// I can't figure out streams, just going to load le data.
		// Use N3
		ttl_loader(file, store)
			.then(() => console.log("Done", store))
			.then(() => update_graph_with_root_parents(store))
			.then(() => console.log("Done", store))
    }


	// Test SPARQL
	// async function test_sparql() {
	// 	const bindingsStream = await sparqlEngine.queryBindings(`
	// 		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	// 		SELECT ?s
	// 		WHERE {
	// 				?s rdf:type <https://brickschema.org/schema/Brick#VAV>
	// 				# ?s ?p ?o
	// 		} LIMIT 10`,
	// 		{sources: [store]}
	// 		);
	// 	const bindings = await bindingsStream.toArray();
	// 	console.log(bindings)
	// }

	// // Generate PREFIX block
	// let prefix_block = ''
	//                 for (let key in prefixes) {
	//                     prefix_block += `PREFIX ${key}: <${prefixes[key].replace(/.$/,"")}#>\n`
	//                 }
</script>