import { writable } from 'svelte/store'
import N3 from 'n3'


export const state = writable({
    fileList: null,
    processed: false,
    processing: false,
    validated: false,
    validating: false,
    n3_store: new N3.Store(),
    instructions: false
})