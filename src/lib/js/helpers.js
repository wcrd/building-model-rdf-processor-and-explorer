import { console_store } from "$lib/stores/ConsoleStore";


function logger(value, { node_type="simple", level="production", mode='write', suppress=false, node_id=null } = {}){
    if(suppress){ return }

    let id;

    if(mode=="reset"){
        console_store.set([])
        // console_store.addNodeToStore(node_type, value)
        return
    } else if(mode=="update"){
        console_store.updateNodeInStore(node_id, node_type, value)
        return
    }


    if(level=="debug"){
        console.debug(value)
        id = console_store.addNodeToStore(node_type, value)
    } else {
        id = console_store.addNodeToStore(node_type, value)

    }

    if(node_type=="fancy"){
        return id
    }
    return
}

export { logger }