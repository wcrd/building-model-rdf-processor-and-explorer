import { writable } from 'svelte/store'
import N3 from 'n3'


export const state = writable({
    fileList: null,
    filePath: null,
    processed: false,
    validated: false,
    n3_store: new N3.Store()
})