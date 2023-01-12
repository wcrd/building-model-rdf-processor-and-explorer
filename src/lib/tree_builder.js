import N3 from 'n3'
const { namedNode } = N3.DataFactory


import { entity_subjects } from '$lib/stores/EntityListStore';
import { entityTrees } from '$lib/stores/TreeGridDataStore';

const tree_types = ["Equipment", "Location", "Collection"];

function generate_trees(n3_store){
    for (let t of tree_types){
        const rows = []
        // loop subjects and grab extra info
        for (let e of entity_subjects[t]){
            // entity info
            const row = {
                subject: e,
                label: n3_store.getObjects(namedNode(e), namedNode("http://www.w3.org/2000/01/rdf-schema#label"), null)[0]?.value,
                class: n3_store.getObjects(namedNode(e), namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), null)[0]?.value,
                path: n3_store.getObjects(namedNode(e), namedNode("http://switch.com/rnd#hasEntityPath"), null)[0]?.value?.split("</>"),
                base_type: t,
            }
            rows.push(row)

            // lets get associated points
            const points = n3_store.getSubjects(namedNode("https://brickschema.org/schema/Brick#isPointOf"), namedNode(e), null)
            for (let p of points){
                const point_row = {
                    subject: p.value,
                    label: n3_store.getObjects(p, namedNode("http://www.w3.org/2000/01/rdf-schema#label"), null)[0]?.value,
                    class: n3_store.getObjects(p, namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"), null)[0]?.value,
                    path: row.path.concat([p.value]),
                    base_type: "Point",
                }
                rows.push(point_row) 
            }
        }
        entityTrees[t] = rows;
        entityTrees.set(entityTrees);
    }
    // console.log(entityTrees)
}

export { generate_trees }