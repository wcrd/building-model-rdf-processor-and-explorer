import { writable } from "svelte/store";

export const entityTrees = writable({
    Equipment: [],
    Location: [],
    Collection: [],
})