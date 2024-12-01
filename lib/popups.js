function DocElemListFromHTML(html) {
    return new DOMParser().parseFromString(html, "text/html").body.childNodes;
}

/** AboutPad popup system */
export function openPopup(html) {
    document.querySelector(".ap-popup-container").classList.remove("hidden")
    document.querySelector(".ap-popup").innerHTML = ""
    let popup = document.querySelector(".ap-popup")
    let elems;
    console.log(typeof html)
    if(typeof html == 'string') {
        let htm = String(html)
        htm = htm.replace(/\$\((.*?)\)\$/g, (a) => {
            return eval(a.replace(/\$\((.*?)\)\$/g, "$1"))
        })
        elems = DocElemListFromHTML(String(htm))
    } else elems = [html]
    let len = elems.length
    for (let i = 0; i < len; i++) {
        const element = elems[0];
        popup.appendChild(element)
    }
    let closeBtn = document.querySelector("#ap-btn-close-popup")
    if(closeBtn) closeBtn.addEventListener('click', (ev) => {
        document.querySelector(".ap-popup-container").classList.add("hidden")
    })
}

document.querySelector(".ap-popup-container").addEventListener("click", function(ev) {
	if(ev.target != this) return;
    this.classList.add("hidden")
	console.log("click!", ev)
})