import N3 from 'n3'
const { namedNode, defaultGraph } = N3.DataFactory
import { logger } from '$lib/js/helpers'

// Static ontologies
import SwitchOntologyPath from '$lib/data/switch.ttl'
import BrickOntologyPath from '$lib/data/brick.ttl'


const parser = new N3.Parser()


async function ttl_loader(file, n3_store){

    // Load user model
    // console.log("## Loading User submitted model")
    logger("## Loading User submitted model")
    const user_model_text = await fileHandler(file);
    await parser.parse(user_model_text, (error, quad) => {
        if (quad) {
            n3_store.addQuad(quad.subject, quad.predicate, quad.object, defaultGraph())
        } else {
            // console.log("# User model loading complete.");
            logger("# User model loading complete.");
        }
    });

    // Load Brick and Switch ontologies
    // SWITCH
    // console.log("## Loading Switch Ontology")
    logger("## Loading Switch Ontology")
    const SwitchOntologyFile = await fetch(SwitchOntologyPath)
    const SwitchOntology = await SwitchOntologyFile.text()
    const SwitchGraph = namedNode("https://graph.com/switch#")
    await parser.parse(SwitchOntology, (error, quad) => {
        if (quad) {
            n3_store.addQuad(quad.subject, quad.predicate, quad.object, SwitchGraph)
        } else {
            // console.log("# Switch Ontology loading complete.");
            logger("# Switch Ontology loading complete.");
        }
    })
    // BRICK
    // console.log("## Loading Brick Ontology")
    logger("## Loading Brick Ontology")
    const BrickOntologyFile = await fetch(BrickOntologyPath)
    const BrickOntology = await BrickOntologyFile.text()
    const BrickGraph = namedNode("https://graph.com/brick#")
    await parser.parse(BrickOntology, (error, quad) => {
        if (quad) {
            n3_store.addQuad(quad.subject, quad.predicate, quad.object, BrickGraph)
        } else {
            // console.log("# Brick Ontology loading complete.");
            logger("# Brick Ontology loading complete.");
        }
    })

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