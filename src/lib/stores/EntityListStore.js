import { writable } from 'svelte/store'

export const entity_subjects = writable({
    data: {
        Equipment: [],
        Location: [],
        Collection: [],
        Point: []
    }
})

export const special_entity_subjects = writable({
    data: {
        Meter: []
    }
})