export default async function uploadFile(blob, sessid) {
    const data = new FormData();
    data.set('reqtype', 'fileupload');
    data.set('fileToUpload', blob);
    data.set('userhash', sessid); // user hash is optional

    const init = {
        method: 'POST',
        headers: {
            'user-agent': navigator.userAgent // use whatever user agent is relevant
        },
        body: data
    };
    const res = await fetch("https://catbox.moe/user/api.php", init);
    const url = await res.text()
    if (url.startsWith('https://files.catbox.moe/')) {
        return url;
    } else {
        throw new Error(url);
    }
}