import { shiftHeld } from "../../lib/key.js"
import html from "../../lib/htmlbuilder.js"

async function fetchJSON(url, opts) {
    let resp = await fetch(url, opts);
    return await resp.json()
}

function scrollToBottomOfElement(element) {
    element.scrollTo(0, element.scrollHeight);
}

export function onload() {
    const msgArea = document.getElementById("messages");

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
                        .text((r.author.display_name ? `${r.author.display_name} (${r.author.username})` : r.author.username)
                        + ": " +r.content)
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

    function createMessage(msg) {
        let elem = html('div')
            .class('message')
            .for(msg.replies, r => html('div')
                .class('reply')
                .text(`→ ${r.author.display_name ? `${r.author.display_name} (${r.author.username})`: r.author.username}: ${r.content}`))
            .child('div')
                .class('message-header')
                .child('span')
                    .class('username')
                    .text(msg.author.display_name ? `${msg.author.display_name} (${msg.author.username})` : msg.author.username)
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
                .text(msg?.content)
            .up()
        msgArea.appendChild(elem)
    }
    document.getElementById("messageForm").classList.remove('disabled')
    msgArea.innerHTML = "";
    // :+1:

    for (const msg of window.stores.sdlib.messages.reverse()) {
        createMessage(msg)
    }
    scrollToBottomOfElement(msgArea.parentElement);

    stores.sdlib.wsEvents.on("new_post", post => {
        console.debug('posting of the poster', post)
		let scrolledToBottom = msgArea.parentElement.scrollTopMax == msgArea.parentElement.scrollTop;
        createMessage(post.data)
		if(scrolledToBottom) scrollToBottomOfElement(msgArea.parentElement);
    })

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