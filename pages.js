export let page = ""

let currPageData = null

export async function goToPage(pageA) {
    if(currPageData?.onunload) currPageData.onunload();
    page = pageA;
    let pageHTML = await (await fetch("./pages/"+pageA+"/page.html")).text();
    document.querySelector(".main").innerHTML = pageHTML
    let pageData = await import("./pages/"+pageA+"/page.js");
    currPageData = pageData;
    if(pageData?.onload) pageData.onload();
}