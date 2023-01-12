import { writable } from 'svelte/store'

export const entity_subjects = writable({
    Equipment: [],
    Location: [],
    Collection: [],
    Point: []
})
