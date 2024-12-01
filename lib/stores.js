export function set(store, value) {
    window.stores[store] = value
    Object.values(window.storesEvents).forEach(ev => {if(ev.store == store) cb()})
}
export function update(store) {
    Object.values(window.storesEvents).forEach(ev => {if(ev.store == store) cb()})
}
export function onChange(store, cb) {
    let id = nextStoresEventID++;
    storesEvents[id] = {store, cb};
    return id;
}