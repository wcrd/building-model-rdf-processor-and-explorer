import { writable } from 'svelte/store'


export const validation_data = writable({});
export const validation_state = writable({
    data: {
        points: false,
        composition: false,
        relationships: false
    }
});