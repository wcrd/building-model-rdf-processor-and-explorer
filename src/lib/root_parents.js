import N3 from 'n3'
const { namedNode, defaultGraph, quad } = N3.DataFactory
// Set up SPARQL server
import { QueryEngine } from '@comunica/query-sparql'
const sparqlEngine = new QueryEngine();


// This has been converted from python; TODO: Optimise for JS & N3

async function update_graph_with_root_parents(n3_store, graph_to_update=defaultGraph(), root_parent_predicate=namedNode("http://switch.com/rnd#hasRootParent")){
    console.log("Removing prior 'root parent' triples.")
    n3_store.removeMatches(null, root_parent_predicate, null, graph_to_update)

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

export { update_graph_with_root_parents }