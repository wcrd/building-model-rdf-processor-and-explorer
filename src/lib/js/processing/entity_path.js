import N3 from 'n3'
const { namedNode, defaultGraph, quad, literal } = N3.DataFactory
// Set up SPARQL server
import { QueryEngine } from '@comunica/query-sparql'
const sparqlEngine = new QueryEngine();

import { entity_subjects } from '$lib/stores/EntityListStore'
import { logger } from '$lib/js/helpers'
// import { get } from 'svelte/store';

// console.debug(
//     defaultGraph()
// )

// CONVERTED FROM PYTHON TO JS.
// TODO: Optimise
// # Essentially the same, we are just going to use a '/' instead of '::'!
// # We are also going to provide an option to choose the field used for the path: i.e. label, id, some tag field, etc.
// # function to generate full entity path (very similar to full entity path, but allows a custom field for display)
// # recursive
// #
// # returns a list of entities, [0] start -> [-1] parent 

// #   FINAL FUNCTION USER CALLS
async function update_graph_with_full_entity_path({
    n3_store,
    return_quads=true, 
    sep="/",
    target_relationship = namedNode("https://brickschema.org/schema/Brick#isPartOf"), 
    graph_to_update=defaultGraph(), 
    entity_path_predicate = namedNode("http://switch.com/rnd#hasEntityPath"),
    types_to_generate_paths = ["Equipment", "Location", "Collection"]
    }={}
    ){
    // # prework
    // ns = {prefix: rdflib.Namespace(namespace) for prefix, namespace in n3_store.namespaces()}
    // // # use the isPartOf heirarchy to generate names
    // prefix = target_relationship.split(":")[0]
    // relationship = target_relationship.split(":")[1]
    // relationship_uri = ns[prefix][relationship]
    
    // array of new quads to add to model
    const quads = []

    // console.log("## Generating entity paths.")
    logger("## Generating entity paths.")
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

        // TODO: Replace repeated queries with reference to this.
        // entity_subjects.data[t]=entities;
        // entity_subjects.set(entity_subjects)
        entity_subjects.update(s => {
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
    if(['NamedNode', 'DefaultGraph'].includes(graph_to_update.constructor.name)){
        // clear old relationships
        // console.log("## Removing prior 'entity path' triples.")
        logger("## Removing prior 'entity path' triples.")
        n3_store.removeMatches(null, target_relationship, null, graph_to_update)

        // add new
        // console.log("## Writing entity paths to graph.")
        logger("## Writing entity paths to graph.")
        for(let quad of quads){
            // set graph to write to
            quad._graph = graph_to_update
            n3_store.addQuad(quad)
        }
    } else {
        logger("ERROR: Invalid graph identifier to update. Please provide a valid namedNode.")
        throw new Error("Invalid graph identifier to update. Please provide a valid namedNode.")
    }

    if(return_quads){
        return quads
    } else {
        return true
    }

    // // # Get all Locations
    // all_locations = n3_store.query("""
    // SELECT DISTINCT ?s
    // WHERE {
    //     ?s rdf:type/rdfs:subClassOf* brick:Location
    // }
    // """)
    // all_locations = list(all_locations)

    // // # Get all Collections
    // all_collections = n3_store.query("""
    // SELECT DISTINCT ?s
    // WHERE {
    //     ?s rdf:type/rdfs:subClassOf* brick:Collection
    // }
    // """)
    // all_collections = list(all_collections)

    
    // // new_relationship = ns['rnd']['hasEntityPath']
    
    // // # DO EQUIPMENT
    // for ent in all_equipment:
    //     entity = ent[0]
    //     // # get path
    //     entity_path = generate_full_entity_path(entity=entity, relationship=relationship_uri, graph=n3_store, entity_type="Equipment")
    //     // # convert path to nice string
    //     entity_path_string = generate_path_display_string(n3_store, entity_path, field_func, sep=sep)


    //     triples.append(
    //         (entity, new_relationship, rdflib.Literal(entity_path_string))
    //     )

    // // # DO LOCATIONS
    // for ent in all_locations:
    //     entity = ent[0]
    //     // # get path
    //     entity_path = generate_full_entity_path(entity=entity, relationship=relationship_uri, graph=n3_store, entity_type="Location")
    //     // # convert path to nice string
    //     entity_path_string = generate_path_display_string(n3_store, entity_path, field_func, sep=sep)


    //     triples.append(
    //         (entity, new_relationship, rdflib.Literal(entity_path_string))
    //     )

    // // # DO COLLECTIONS
    // for ent in all_collections:
    //     entity = ent[0]
    //     // # get path
    //     entity_path = generate_full_entity_path(entity=entity, relationship=relationship_uri, graph=n3_store, entity_type="Collection")
    //     // # convert path to nice string
    //     entity_path_string = generate_path_display_string(n3_store, entity_path, field_func, sep=sep)


    //     triples.append(
    //         (entity, new_relationship, rdflib.Literal(entity_path_string))
    //     )

    
}


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
        entity.constructor.name == "NamedNode" ? path.push(entity) : path.push(namedNode(entity))
        return path
    } else if(x > 1){
        // error - models should only have one part path for equipment parentage.
        // return error
        console.debug("ERROR - more than one parent: ", entity, parents)
        // throw new Error("More than one parent exists in the path to the root for this entity. This is not allowed. Please review your model.")
        return path
    } else if(x == 1){
        // add entity to path
        entity.constructor.name == "NamedNode" ? path.push(entity) : path.push(namedNode(entity))
        // call this function again, with parent as entity.
        return await generate_full_entity_path(parents[0], relationship, n3_store, valid_entities, path, max_depth, current_depth+1)
    }


    // if (x:=len(parent)) == 0:
    //     # no parent
    //     return path + [entity]
    // elif x > 1:
    //     # error - models should only have one part path for equipment parentage.
    //     # return error
    //     print(entity, parent)
    //     raise ValueError("More than one parent exists in the path to the root for this entity. This is not allowed. Please review your model.")
    // elif x == 1:
    //     # check if base type is OK (i.e. Equipment)
    //     if not is_entity_of_type(parent[0], graph, entity_type):
    //         return path + [entity]
    //     else:
    //         # add to path and continue
    //         path.append(entity)
    //     # continue
    //     return generate_full_entity_path(parent[0], relationship, graph, entity_type, path, max_depth, current_depth+1)
}




export { update_graph_with_full_entity_path }