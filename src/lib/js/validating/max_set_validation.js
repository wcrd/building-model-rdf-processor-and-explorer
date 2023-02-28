import SHACLValidator from "rdf-validate-shacl";
import N3 from 'n3'
import { ttl_loader } from "$lib/js/processing/ttl_loader";
import { validationReportProcessor } from "$lib/js/validating/validation_result_processor";
import { logger } from "$lib/js/helpers";

// Steps:
// For each shape file:
// 1. Load shapes
// 2. Run validation
// 3. Store result

// Get all shapes for this module
const shapeFiles = import.meta.glob('$lib/data/shapes/points_max/*.ttl')

async function validate(n3_store){
    logger("# Validation for max points sets initiated.")
    // loop through each available shape and validate
    for (let shape in shapeFiles){
        let msg_id;
        // get shape path
        let shape_path;
        await shapeFiles[shape]().then(({default: path}) => shape_path = path)
        const shape_abbrev = shape_path.split("/").pop();
        // load the shape
        msg_id = logger({msg_base: `Validating ${shape_abbrev}:`, msg_dynamic: "Loading shapes...", state: "pending"}, {node_type: "fancy"})
        // logger(`Loading ${shape_abbrev} shapes.`)
        const shp_data = await fetch(shape_path).then((r) => {return r.blob()});
        const shp_store = new N3.Store();
        await ttl_loader(shp_data, shp_store, { load_ontologies: false, log_messages: false });
        // Create shapes graph
        logger({msg_dynamic: "Preparing validator..."}, {node_type: "fancy", mode: 'update', node_id: msg_id})
        // logger('↳ Preparing validator...')
        const validator = new SHACLValidator(shp_store);
        // Validate
        logger({msg_dynamic: "Validating..."}, {node_type: "fancy", mode: 'update', node_id: msg_id})
        // logger('↳ Validating...')
        const report = await validator.validate(n3_store)
        // DEBUG: FOR NOW, just print the report
        // console.log("Validation results for ", shape_abbrev, "\n", report)
        // logger(`↳ Validation for ${shape_abbrev} complete. See console for report.`)
        // Process report (async, hand this off and continue)
        logger({msg_dynamic: "Processing results..."}, {node_type: "fancy", mode: 'update', node_id: msg_id})
        // logger('↳ Processing results...')
        // add custom ID for tracking
        report.__rid = shape_abbrev;
        logger({msg_dynamic: "Begin report processing..."}, {node_type: "fancy", mode: 'update', node_id: msg_id})
        await validationReportProcessor(report)
        logger({msg_dynamic: "Validation completed.", state: 'success'}, {node_type: "fancy", mode: 'update', node_id: msg_id})

    }
    logger("## Validation complete.")
    return true
}

// TESTING
// load shapes and make available to console

// import { state } from "../../stores/AppStateStore";
// import { get } from "svelte/store";

// // load one shape and create validator
// async function testSetup(){
//     const shp_data = await fetch("/src/lib/data/shapes/points_max/AHU.ttl").then((r) => {return r.blob()});
//     const shp_store = new N3.Store();
//     await ttl_loader(shp_data, shp_store, { load_ontologies: false, log_messages: false });
//     const validator = new SHACLValidator(shp_store);
//     console.log("model store: ", get(state))
//     return validator
// }



// Base elements
// console.debug(
//     "SHACL: ", SHACLValidator,
//     "\nShape Paths: ", shapeFiles,
//     "\nttl loader: ", ttl_loader,
//     "\nN3: ", N3,
//     "\n app state: ", state,
//     "\nTest Function: ", testSetup
// )

export { validate }