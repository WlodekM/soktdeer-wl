async function fetchJSON(url, opts) {
    let resp = await fetch(url, opts);
    return await resp.json()
}

export function onload() {
    if (localStorage.hasOwnProperty('token') && typeof localStorage.getItem('token') == 'string') {
        window.stores.sdlib.wsEvents.once('greet', async () => {
            document.getElementById('topbar').classList.remove('hidden')
            await window.stores.sdlib.loginToken(localStorage.getItem('token'), localStorage.getItem('username'));
            pages.goToPage('main')
        })
    }
    document.getElementById("loginForm").addEventListener("submit", async function (ev) {
        ev.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        document.getElementById('topbar').classList.remove('hidden')
        try {
            const token = await stores.sdlib.login(username, password)
            localStorage.setItem('token', token)
            localStorage.setItem('username', username)
        } catch (error) {
            console.error(error)
            return document.getElementById('error').innerText = 'An error occured\n' + error
        }
        pages.goToPage("main")
    })
}