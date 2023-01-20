import { writable } from 'svelte/store'
import N3 from 'n3'


export const state = writable({
    file_path: null,
    processed: false,
    validated: false,
    n3_store: new N3.Store()
})