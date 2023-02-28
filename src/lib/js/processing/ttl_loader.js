import N3 from 'n3'
const { namedNode, defaultGraph } = N3.DataFactory
import { logger } from '$lib/js/helpers'

// Static ontologies
import SwitchOntologyPath from '$lib/data/switch.ttl'
import BrickOntologyPath from '$lib/data/brick.ttl'


const parser = new N3.Parser()


async function ttl_loader(file, n3_store, { load_ontologies = true, log_messages = true } = {}){
    let msg_id;
    // Load user model
    // console.log("## Loading User submitted model")
    msg_id = logger({msg_base: "Loading User submitted model:", msg_dynamic: "Loading", state: 'pending'}, {node_type: 'fancy', suppress: !log_messages})
    const user_model_text = await fileHandler(file);
    await parser.parse(user_model_text, (error, quad) => {
        if (quad) {
            n3_store.addQuad(quad.subject, quad.predicate, quad.object, defaultGraph())
        } else {
            logger({msg_dynamic: "Complete", state: "success"}, {node_type: 'fancy', mode: 'update', node_id: msg_id, suppress: !log_messages});
        }
    });

    if (load_ontologies){
        // Load Brick and Switch ontologies
        // SWITCH
        // console.log("## Loading Switch Ontology")
        msg_id = logger({msg_base: "Loading Switch Ontology:",  msg_dynamic: "Loading", state: 'pending'}, {node_type: 'fancy', suppress: !log_messages})
        const SwitchOntologyFile = await fetch(SwitchOntologyPath)
        const SwitchOntology = await SwitchOntologyFile.text()
        const SwitchGraph = namedNode("https://graph.com/switch#")
        await parser.parse(SwitchOntology, (error, quad) => {
            if (quad) {
                n3_store.addQuad(quad.subject, quad.predicate, quad.object, SwitchGraph)
            } else {
                // console.log("# Switch Ontology loading complete.");
                logger({msg_dynamic: "Complete", state: 'success'}, {node_type: 'fancy', mode: 'update', node_id: msg_id, suppress: !log_messages})
            }
        })
        // BRICK
        // console.log("## Loading Brick Ontology")
        msg_id = logger({msg_base: "Loading Brick Ontology:", msg_dynamic: "Loading", state: 'pending'}, {node_type: 'fancy', suppress: !log_messages})
        const BrickOntologyFile = await fetch(BrickOntologyPath)
        const BrickOntology = await BrickOntologyFile.text()
        const BrickGraph = namedNode("https://graph.com/brick#")
        await parser.parse(BrickOntology, (error, quad) => {
            if (quad) {
                n3_store.addQuad(quad.subject, quad.predicate, quad.object, BrickGraph)
            } else {
                // console.log("# Brick Ontology loading complete.");
                logger({msg_dynamic: "Complete", state: 'success'}, {node_type: 'fancy', mode: 'update', node_id: msg_id, suppress: !log_messages})
            }
        })
    }

    return true
}

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

export { ttl_loader }