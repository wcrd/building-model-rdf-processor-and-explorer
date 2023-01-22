// import { state } from '$app/stores/AppStateStore' // has dataset rdf
import { entity_subjects } from '$lib/stores/EntityListStore' // has entities broken out into categories
import { entityTrees } from '$lib/stores/TreeGridDataStore'
// import FakeData from '$lib/data/fake_data.json'

import { get } from 'svelte/store'

// Result object for dashboard. May move to store so don't have to regen every time page is loaded.
const dataset = {
    chart_categories: {
        Total: 0
    }
}

let dataset_2 = {}

// Generate Total Counts
function generateData_TotalCounts(){
    // reset total counter
    dataset.chart_categories.Total = 0;
    // loop and calc
    for (const [core_type, entity_list] of Object.entries(get(entity_subjects).data)){
        dataset.chart_categories[core_type] = entity_list.length;
        dataset.chart_categories.Total += entity_list.length;
    }
    console.debug("Dataset: Total Counts = Done")
    // console.debug(get(entity_subjects))
    return true
}

function generateData_ClassSets(){
    // get store value
    const _trees = get(entityTrees);
    // class set in building
    const Equipment = _trees.Equipment.filter(row => row.base_type=="Equipment").map(row => row.class).reduce((acc, curr) =>{ if(curr in acc){ acc[curr]+=1 } else { acc[curr] = 1} return acc}, {});
    const Location = _trees.Location.filter(row => row.base_type=="Location").map(row => row.class).reduce((acc, curr) =>{ if(curr in acc){ acc[curr]+=1 } else { acc[curr] = 1} return acc}, {});
    const Collection = _trees.Collection.filter(row => row.base_type=="Collection").map(row => row.class).reduce((acc, curr) =>{ if(curr in acc){ acc[curr]+=1 } else { acc[curr] = 1} return acc}, {});

    dataset_2 = { Equipment, Location, Collection }
    return true
}

export { dataset, generateData_TotalCounts, dataset_2, generateData_ClassSets }

