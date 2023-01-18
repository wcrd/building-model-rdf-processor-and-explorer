import { writable } from 'svelte/store'

function createConsole() {
    const {subscribe, update, set } = writable([])

    return {
        subscribe,
        set,
        addNodeToStore: function(value) {
            const p = document.createElement('p')
            p.textContent = value
            update(val => [...val, p])
        },
    }
}

export const console_store = createConsole();