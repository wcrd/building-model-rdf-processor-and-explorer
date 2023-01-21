// import { state } from '$app/stores/AppStateStore' // has dataset rdf
import { entity_subjects } from '$lib/stores/EntityListStore' // has entities broken out into categories
import FakeData from '$lib/data/fake_data.json'

// Result object for dashboard. May move to store so don't have to regen every time page is loaded.
const dataset = {
    chart_categories: {
        Total: 0
    }
}

// Generate Total Counts
for (const [core_type, entity_list] of Object.entries(FakeData)){
    dataset.chart_categories[core_type] = entity_list.length;
    dataset.chart_categories.Total += entity_list.length;
}

export { dataset }

