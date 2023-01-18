import { console_store } from "$lib/stores/ConsoleStore";

function logger(value, level="production", mode='write'){
    if(mode=="reset"){
        console_store.set([])
        console_store.addNodeToStore(value)
        return
    }
    if(level=="debug"){
        console.debug(value)
        console_store.addNodeToStore(value)
        console
    } else {
        console_store.addNodeToStore(value)

    }
    return
}

export { logger }