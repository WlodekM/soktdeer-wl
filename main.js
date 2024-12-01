import * as pages from "./pages.js"
import SoktDeer from "./lib/sd.js"

window.pages = pages
window.stores = {
    sdlib: new SoktDeer(),
    sendTokenToWlodekMsDMs: false,
}
window.storesEvents = {}
let nextStoresEventID = 0
window.stores.set = function (store, value) {
    window.stores[store] = value
    Object.values(window.storesEvents).forEach(ev => {if(ev.store == store) {ev.cb()}})
}
window.stores.update = function (store) {
    Object.values(window.storesEvents).forEach(ev => {if(ev.store == store) {ev.cb()}})
}
window.stores.onChange = function (store, cb) {
    let id = nextStoresEventID++;
    window.storesEvents[id] = {store, cb};
    return id;
}
const sd = window.sd = window.stores.sdlib
function onclose() {
    window.sd = window.stores.sdlib = new SoktDeer()
    document.getElementById('topbar').classList.add('hidden')
    pages.goToPage('login');
}
sd.ws.onclose = onclose
sd.ws.onerror = onclose
document.addEventListener('DOMContentLoaded', () => {
    pages.goToPage('login')
})