//
//
// This is written as POC first. It shares many common methods with entity_paths.
// This will be refactored once working.
//
//

import N3 from 'n3'
const { namedNode, defaultGraph, quad, literal } = N3.DataFactory
// Set up SPARQL server
import { QueryEngine } from '@comunica/query-sparql'
const sparqlEngine = new QueryEngine();

import { special_entity_subjects } from '$lib/stores/EntityListStore'
import { logger } from '$lib/js/helpers'

//
// ONLY LOG MESSAGES HAVE BEEN CHANGED....
//
async function update_graph_with_metering_path({
    n3_store,
    return_quads=true, 
    sep="/",
    target_relationship = namedNode("https://brickschema.org/schema/Brick#isSubMeterOf"), 
    graph_to_update=defaultGraph(), 
    entity_path_predicate = namedNode("http://switch.com/rnd#hasMeterPath"),
    types_to_generate_paths = ["Meter"]
    }={}
    ){

    // array of new quads to add to model
    const quads = []
    
    // logging vars
    let main_msg_id, msg_id;
    // logger("## Generating meter paths.")
    main_msg_id = logger({msg_base: "Processing meter paths.", msg_dynamic: "Working...", state: 'pending'}, {node_type: 'fancy'})

    for (let t of types_to_generate_paths){
        // Get all Entities
        const bindingsStream = await sparqlEngine.queryBindings(`
            # TODO: use a prefix block here
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX brick: <https://brickschema.org/schema/Brick#>
            PREFIX switch: <https://switchautomation.com/schemas/BrickExtension#>
            SELECT DISTINCT ?s
            WHERE {
                ?s rdf:type/rdfs:subClassOf* brick:${t}
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

        // Add to store
        special_entity_subjects.update(s => {
            s.data[t] = entities;
            return s
        });


        // # Loop through Nodes and generate Full Entity Path
        for (let ent of entities){
            // # get path
            const entity_path = await generate_full_entity_path(ent, target_relationship, n3_store, entities)
            // console.debug(entity_path)
            // # convert path to nice string
            // const entity_path_string = generate_path_display_string(n3_store, entity_path, field_func, sep=sep)
            const entity_path_string = entity_path.reverse().map(node => node.value).join(sep)

            quads.push(
                quad(namedNode(ent), entity_path_predicate, literal(entity_path_string), null)
            )
        }
    }

    // # Add to graph
    if(['NamedNode', 'DefaultGraph'].includes(graph_to_update.termType)){
        // clear old relationships
        // logger("## Removing prior 'meter path' triples.")
        msg_id = logger({msg_base: "↳ Removing prior 'meter path' triples.", state: 'pending'}, {node_type: 'fancy'})
        n3_store.removeMatches(null, target_relationship, null, graph_to_update)
        logger({state: 'success'}, {mode: 'update', node_type: 'fancy', node_id: msg_id})

        // add new
        // logger("## Writing meter paths to graph.")
        msg_id = logger({msg_base: "↳ Writing meter paths to graph.", state: 'pending'}, {node_type: 'fancy'})
        for(let quad of quads){
            // set graph to write to
            quad._graph = graph_to_update
            n3_store.addQuad(quad)
        }
        logger({state: 'success'}, {mode: 'update', node_type: 'fancy', node_id: msg_id})
    } else {
        logger("ERROR: Invalid graph identifier to update. Please provide a valid namedNode.")
        logger({state: 'fail'}, {mode: 'update', node_type: 'fancy', node_id: main_msg_id})
        throw new Error("Invalid graph identifier to update. Please provide a valid namedNode.")
    }

    logger({msg_dynamic: "Complete", state: 'success'}, {mode: 'update', node_type: 'fancy', node_id: main_msg_id})
    if(return_quads){
        return quads
    } else {
        return true
    }
}

//
// UNCHANGED
//
async function generate_full_entity_path(entity, relationship, n3_store, valid_entities, path=[], max_depth=10, current_depth=0){
    /**
    @param {} entity        Entity to generate path for
    @param {} relationship  Relationship to traverse
    @param {} entity_type   Entity types to follow relationship along - NOT REQUIRED as we are using the valid_entities shortcut
    @param {} valid_entities Array of entity subjects that are valid for path traversal (this is a shortcut to determining type)
    */
    // # handle list as argument
    if(path==null){
        path = []
    }
    // # guard
    if(current_depth >= max_depth){
        throw new Error(`Max depth of ${max_depth} reached. Increase max_depth parameter if required.`)
    }

    // get parent(s)
    let parents = n3_store.getObjects(entity, relationship, null)
    // New Method - reduce to just entities in valid entity list (generally entities of same type)
    parents = parents.filter(entity => valid_entities.includes(entity.value))
    
    const x = parents.length;
    if (x == 0){
        // no parent
        // return current entity path
        entity.termType == "NamedNode" ? path.push(entity) : path.push(namedNode(entity))
        return path
    } else if(x > 1){
        // error - models should only have one part path for equipment parentage.
        // return error
        console.debug("ERROR - more than one parent: ", entity, parents)
        // throw new Error("More than one parent exists in the path to the root for this entity. This is not allowed. Please review your model.")
        return path
    } else if(x == 1){
        // add entity to path
        entity.termType == "NamedNode" ? path.push(entity) : path.push(namedNode(entity))
        // call this function again, with parent as entity.
        return await generate_full_entity_path(parents[0], relationship, n3_store, valid_entities, path, max_depth, current_depth+1)
    }
}

export { update_graph_with_metering_path }