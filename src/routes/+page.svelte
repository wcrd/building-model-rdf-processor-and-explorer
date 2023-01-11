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
	const { namedNode, literal, defaultGraph, quad } = N3.DataFactory
    // import wasmtree from '@bruju/wasm-tree';
		
	// Set up SPARQL server
	import { QueryEngine } from '@comunica/query-sparql'
	const sparqlEngine = new QueryEngine();

	// Static ontologies
	import SwitchOntologyPath from '$lib/data/switch.ttl'
	import BrickOntologyPath from '$lib/data/brick.ttl'

	// // debug
	// const debug = {
	// 	sparqlEngine,
	// 	namedNode,
	// 	literal,
	// 	defaultGraph
	// }
	// console.log(debug)

    let files;
    // let store = new wasmtree.Store();
    let store = new N3.Store();
    // let prefixes;

    $: if (files) {
		// Note that `files` is of type `FileList`, not an Array:
		// https://developer.mozilla.org/en-US/docs/Web/API/FileList
		const file = files[0]

		// I can't figure out streams, just going to load le data.
		// Use N3
		loader(file)
			.then(() => console.log("Done", store))
			.then(() => update_graph_with_root_parents(store))
			.then(() => console.log("Done", store))
    }


	async function loader(file){
		const parser = new N3.Parser()

		// Load user model
		console.log("## Loading User submitted model")
		const user_model_text = await fileHandler(file);
		await parser.parse(user_model_text, (error, quad, prefixes) => {
			if (quad) {
				store.addQuad(quad.subject, quad.predicate, quad.object, defaultGraph())
			} else {
				console.log("# User model loading complete.");
			}
		});

		// Load Brick and Switch ontologies
		// SWITCH
		console.log("## Loading Switch Ontology")
		const SwitchOntologyFile = await fetch(SwitchOntologyPath)
		const SwitchOntology = await SwitchOntologyFile.text()
		const SwitchGraph = namedNode("https://graph.com/switch#")
		await parser.parse(SwitchOntology, (error, quad, prefixes) => {
			if (quad) {
				store.addQuad(quad.subject, quad.predicate, quad.object, SwitchGraph)
			} else {
				console.log("# Switch Ontology loading complete.");
			}
		})
		// BRICK
		console.log("## Loading Brick Ontology")
		const BrickOntologyFile = await fetch(BrickOntologyPath)
		const BrickOntology = await BrickOntologyFile.text()
		const BrickGraph = namedNode("https://graph.com/brick#")
		await parser.parse(BrickOntology, (error, quad, prefixes) => {
			if (quad) {
				store.addQuad(quad.subject, quad.predicate, quad.object, BrickGraph)
			} else {
				console.log("# Brick Ontology loading complete.");
			}
		})

		// DEBUG
		// console.log(store)
		// console.log(user_model_text)


		return true
	}

	async function enricher(store){

		return true
	}

    // // //
    // File Input Reading Functions
    // // //
    async function fileHandler(file){
		const text = await readFileAsync(file)
		return text
    };

	// Helper function to read async
	function readFileAsync(file) {
		return new Promise((resolve, reject) => {
			let reader = new FileReader();

			reader.onload = () => {
				resolve(reader.result);
			};

			reader.onerror = reject;

			reader.readAsText(file);
		})
	}

	// OLD methods - didn't quite work.
	// async function fileHandler(file){
    //     const reader = new FileReader()
    //     const fileBlob = await file.stream()
	// 	console.log(fileBlob)

    //     const streamHandle = await streamToText(fileBlob)
    //     return streamHandle
    // };

    // const streamToText = async (blob) => {
    //   const readableStream = await blob.getReader();
    //   const chunk = await readableStream.read();

    //   return new TextDecoder('utf-8').decode(chunk.value);
    // };

	// // //
	// Root Parents
	// // //

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

	// This has been converted from python; TODO: Optimise for JS & N3

	async function update_graph_with_root_parents(n3_store, graph_to_update=defaultGraph(), root_parent_predicate=namedNode("http://switch.com/rnd#hasRootParent")){
		console.log("Removing prior 'root parent' triples.")
		const x = n3_store.removeMatches(null, root_parent_predicate, null, graph_to_update)

		console.log("Generating root parents.")
        const quads = await generate_root_parents(n3_store)

		console.log("Writing root parent to graph.")
        for(let quad of quads){
			// set graph to write to
			quad._graph = graph_to_update
			n3_store.addQuad(quad)
		}
		return true
	}

	async function generate_root_parents(n3_store, relationship=namedNode("https://brickschema.org/schema/Brick#isPartOf"), max_depth=10, root_parent_predicate=namedNode("http://switch.com/rnd#hasRootParent")){
		
		// Get all Equipment
		const bindingsStream = await sparqlEngine.queryBindings(`
			# TODO: use a prefix block here
			PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
			PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
			PREFIX brick: <https://brickschema.org/schema/Brick#>
			PREFIX switch: <https://switchautomation.com/schemas/BrickExtension#>
			SELECT DISTINCT ?s
			WHERE {
				?s rdf:type/rdfs:subClassOf* brick:Equipment
			}`,
			{ sources: [ n3_store ], unionDefaultGraph: true }
		);
		// TODO: Convert to using a stream, it is faster
		// https://comunica.dev/docs/query/getting_started/query_app/
		let bindings = await bindingsStream.toArray();
		// extract just the result binding
		const entities = [];
		for (let entry of bindings){
			entities.push(entry.get('s').value)
		}
		// console.log(entities)
		// console.log(bindings)

		// New relationship to write
		const new_relationship_p = root_parent_predicate

		// Loop through Nodes and generate root parent
		const quads = []
		// const new_relationship = prefixes['rnd']['hasRootParent']
		for (let entity of entities){
				// console.log(entity)

				const root = await get_root_parent(entity, relationship, n3_store, max_depth, 0, entities)
				// console.log("Entity: ", entity, "Root: ", root)

				quads.push(
						quad(namedNode(entity), new_relationship_p, root, null)
				)
		}

		return quads
	}

	async function get_root_parent(entity, relationship, n3_store, max_depth, current_depth, valid_entities){
		// guard
		if(current_depth >= max_depth){
			console.log(entity)
			throw new Error(`Max depth of ${max_depth} reached. Increase max_depth parameter if required.`)
		}
		// get parent(s)
		let parents = n3_store.getObjects(entity, relationship, null)
		// reduce to just equipment
		// *******************
		// this is the old method (more robust)
		// in reality though, we just need to check whether the parent is in the list of equipment for the model that we calculated earlier!
		// this will reduce computation time.
		// parent = list(filter(lambda x: is_entity_of_type(x, graph), parent)) 
		//
		// New Method
		parents = parents.filter(entity => valid_entities.includes(entity.value))
		
		const x = parents.length;
		if (x == 0){
			// no parent
			// return current entity
			return entity.constructor.name == "NamedNode" ? entity : namedNode(entity)
		} else if(x > 1){
			// error - models should only have one part path for equipment parentage.
			// return error
			console.debug("ERROR: ", entity, parents)
			throw new Error("More than one parent exists in the path to the root for this entity. This is not allowed. Please review your model.")
		} else if(x == 1){
			// call this function again, with parent as entity.
			return get_root_parent(parents[0], relationship, n3_store, max_depth, current_depth+1, valid_entities)
		}
	}

	// async function is_entity_of_type(entity, n3_store, entity_type = "Equipment"){
	// 	const supported_types = ["Equipment", "Location", "Collection"]
	// 	if(!supported_types.includes(entity_type)){
	// 		throw new Error(`entity_type: ${entity_type} not supported. Please use one of: ${supported_types}`)
	// 	} else {
	// 		base_class = get_base_class(entity, graph)
	// 		return base_class.split("#")[-1] == entity_type
	// 	}
	// }

	// def get_base_class(entity, graph, base_level = 1, depth_limit=15):
	// 	'''
	// 	:base_level: how far down the class heirarchy to return as 'base'. base_level=0 is the root (for brick, this is simply 'Class')
	// 	'''
	// 	depth = 0
	// 	# get type of entity
	// 	entity_class = list(graph.objects(entity, rdflib.RDF.type))
	// 	if len(entity_class)==0:
	// 		raise ValueError(f"No class found in graph for entity {entity}.")

	// 	path = _climb_class_heirarchy(entity_class[0], graph, depth_limit, depth)

	// 	try:
	// 		return path[base_level]
	// 	except IndexError:
	// 		print(f"Requested base level {base_level} does not exist. Returning level 0 instead")
	// 		return path[0]



	// def _climb_class_heirarchy(entity_class, graph, depth_limit, depth, path=[]) -> list:
	// 	'''
	// 	Path is used for storing the journey to the root class. Users can request base class at level {n}. Base of all classes is 'Class' which is level 0.
	// 	'''
	// 	# guard
	// 	if depth >= depth_limit:
	// 		raise RecursionError(f"Max depth of {depth_limit} reached. Increase depth_limit parameter if required.")

	// 	# add current class to path
	// 	path.insert(0, entity_class)

	// 	# get parent
	// 	parent = list(graph.objects(entity_class, rdflib.RDFS.subClassOf))
	// 	# filter out BNodes - they are not useful to us here. We want explicit class definitions only.
	// 	parent = list(filter(lambda x: not isinstance(x, rdflib.term.BNode), parent))
		
	// 	# take first and climb
	// 	if len(parent)==0:
	// 		return path
	// 	else:
			
	// 		return _climb_class_heirarchy(parent[0], graph, depth_limit, depth+1, path)




// // Generate PREFIX block
// let prefix_block = ''
//                 for (let key in prefixes) {
//                     prefix_block += `PREFIX ${key}: <${prefixes[key].replace(/.$/,"")}#>\n`
//                 }
</script>