import { shiftHeld } from "../../lib/key.js"
import html from "../../lib/htmlbuilder.js"
import markdwonits from "https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm"
import { openPopup } from "../../lib/popups.js";

window.html = html // debug

const md = markdwonits({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) {}
        }
    
        return ''; // use external default escaping
    }
})

async function fetchJSON(url, opts) {
    let resp = await fetch(url, opts);
    return await resp.json()
}

function buildUserPopup(userData) {
    return html('div')
        .child('pre')
            .text(JSON.stringify(userData))
            .up()
}

function scrollToBottomOfElement(element) {
    element.scrollTo(0, element.scrollHeight);
}

let handleNewPost;

function deHTML(t) {
    t = t.replaceAll("<", "&lt;")
    t = t.replaceAll("&", "&gt;")
    return t
}

function getUsernameHTML(msg) {
    return msg.author.display_name ? `${deHTML(msg.author.display_name)} (<code>${deHTML(msg.author.username)}</code>)`: deHTML(r.author.username)
}

export async function onload() {
    const msgArea = document.getElementById("messages");

    handleNewPost = function handleNewPost(post) {
        console.debug('posting of the poster', post)
        let scrolledToBottom = msgArea.parentElement.scrollTopMax == msgArea.parentElement.scrollTop;
        createMessage(post.data)
        if(scrolledToBottom) scrollToBottomOfElement(msgArea.parentElement);
    }

    let replies = []

    function rednerReplyThingy() {
		let scrolledToBottom = msgArea.parentElement.scrollTopMax == msgArea.parentElement.scrollTop;
        let elem = html('div')
            .class('replies')
            .attr('id', 'replies')
            .for(replies, (r, i) => 
                html('div')
                    .class('reply')
                    .child('span')
                        .html(getUsernameHTML(r) + ": " + deHTML(String(r.content).slice(0, 50)))
                        .up()
                    .child('button')
                        .text('x')
                        .ev('click', e => {
                            replies.splice(i, 1);
                            rednerReplyThingy();
                        })
                        .up()
            );
        if(document.getElementById('repliesContainer').firstChild)
            document.getElementById('repliesContainer').firstChild.remove()
        document.getElementById('repliesContainer').prepend(elem);
		if(scrolledToBottom) scrollToBottomOfElement(msgArea.parentElement);
    }

    async function createMessage(msg) {
        const elem = html('div')
        msgArea.appendChild(elem)
        let types = [];
        for (const attachment of msg.attachments) {
            console.debug(attachment)
            const resp = await fetch(attachment.toString());
            types.push(resp.headers.get('content-type'))
        }
        elem.class('message')
            .child('div')
                .class('message-container')
                .child('img')
                    .attr('src', msg.author.avatar || '/assets/pfp_sdwl.png')
                    .class('avatar')
                    .ev('click', e => openPopup(buildUserPopup(msg.author)))
                    .up()
                .child('div')
                    .class('message-content-container')
                    .for(msg.replies, r => html('div')
                        .class('reply')
                        .html(`→ ${getUsernameHTML(r)}: ${deHTML(String(r.content).slice(0, 50))}`))
                    .child('div')
                        .class('message-header')
                        .child('span')
                            .class('username')
                            .html(getUsernameHTML(msg))
                            .up()
                        .child('div')
                            .class('action-buttons')
                            .child('button')
                                .text('reply')
                                .ev('click', e => {
                                    if(msg.length >= 3) return;
                                    replies.push(msg);
                                    rednerReplyThingy();
                                })
                                .up()
                            .up()
                        .up()
                    .child('span')
                        .class('post-content')
                        .html(md.render(msg?.content))
                    .child('div')
                        .for(msg.attachments, (a, i) => {
                            if(types[i].startsWith('image')) {
                                return html('img').class('attachment').attr('src', a)
                            } else if (types[i].startsWith('video')) {
                                return html('video')
                                    .class('attachment')
                                    .attr('controls', 1)
                                    .child('source')
                                        .attr('src', a)
                                        .attr('type', types[i])
                                        .up()
                            } else {
                                return html('a')
                                    .attr('target', '_blank')
                                    .txt(`Attachment ${i + 1} (${a})`)
                                    .attr('href', a)
                            }
                        })
                        .up()
                    .up()
                .up()
            .up()
    }
    document.getElementById("messageForm").classList.remove('disabled')
    msgArea.innerHTML = "";
    // :+1:

    msgArea.style.display = 'none'

    for (const msg of window.stores.sdlib.messages) {
        createMessage(msg)
    }
    msgArea.style.display = 'block'
    scrollToBottomOfElement(msgArea.parentElement);

    stores.sdlib.wsEvents.on("new_post", handleNewPost)

    const submitBtn = document.getElementById("send")

    submitBtn.onclick = function (event) { // using on(event) = ... instead of addEventListener("(event)", ...) because i cant be bothered to clear the event on channel change lol
        let msg = document.getElementById("messageInput").value;
        stores.sdlib.ws.send(JSON.stringify({
            command: "post",
            content: msg,
            replies: replies.map(p => p.id),
            attachments: []
        }))
        replies = [];
        rednerReplyThingy()
        document.getElementById("messageInput").value = ""
    }

    document.getElementById('messageInput').addEventListener('keydown', event => {
        if (
            event.key == "Enter" &&
            !shiftHeld
        ) {
            event.preventDefault();
            if (!submitBtn.disabled) submitBtn.click();
        }
    })
}

export function onunload() {
    stores.sdlib.wsEvents.off('new_post', handleNewPost)
}