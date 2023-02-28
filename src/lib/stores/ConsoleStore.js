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

// export const console_store = createConsole();

function createConsoleFancy() {
    const {subscribe, update, set } = writable([])
    let id = 0;

    return {
        subscribe,
        set,
        // addNodeToStore: function(msg_base, msg_dynamic, state) {
        //     update(val => [...val, {msg_base, msg_dynamic, state}])
        // },
        addNodeToStore: function(node_type, params={}) {
            id+=1;
            update(val => [...val, { id, node_type, params }])
            return id
            
        },
        updateNodeInStore: function(node_id, new_node_type, new_params) {
            update(msgs => {
                // find record in list
                const recordIdx =  msgs.findIndex(n => n.id == node_id)
                // update record
                msgs[recordIdx] = { id: node_id, node_type: new_node_type, params: new_params }
                return msgs
            })
            return
        },
    }
}

export const console_store = createConsoleFancy();