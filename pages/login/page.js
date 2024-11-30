async function fetchJSON(url, opts) {
    let resp = await fetch(url, opts);
    return await resp.json()
}

export function onload() {
    document.getElementById("loginForm").addEventListener("submit", async function (ev) {
        ev.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        document.getElementById('topbar').classList.remove('hidden')
        try {
            await stores.sdlib.login(username, password)
        } catch (error) {
            return document.getElementById('error').innerText = 'An error occured\n' + error
        }
        pages.goToPage("main")
    })
}