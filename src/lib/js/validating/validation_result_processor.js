// This module take a validation result object from SHACLValidator and processes it into a custom agGrid friendly store.

import { validation_data } from "$lib/stores/ValidationStore"
// import { get } from "svelte/store"
import { logger } from "$lib/js/helpers";

async function validationReportProcessor(report){
    logger(`↳↳ Begin report processing for ${report.__rid}`)
    // for each result, add important info to the validation_data object
    for (let r of report.results){

        validation_data.update(v => {
            // consts to make processing easier
            const focus = r.focusNode.id;
            const value = r.value.id;
            // check if records exists
            if (!(value in v)){ v[value] = entityValidationObjectFactory()}
            if (!(focus in v)){ v[focus] = entityValidationObjectFactory()}

            // update data
            // write point info
            v[value].points.valid = false;
            v[value].points.messages.push({ctx: focus, msg: r.message[0].value})
            // write entity info
            v[focus].points.valid = false; // don't need messages; they live on the point in this case. (will highlight points red)
            
            // console.debug('Report: ', report.__rid, " Result (f, v, m): ", focus, value, r.message)
            return v
        });
    }
    logger(`↳↳↳ Complete report processing for ${report.__rid}`)
    return true
}


function entityValidationObjectFactory(){
    return {
        'composition': {
            'valid': null,
            'messages': []
        },
        'relationships': {
            'valid': null,
            'messages': []
        },
        'points': {
            'valid': null,
            'messages': []
        },
    }
}

export { validationReportProcessor }