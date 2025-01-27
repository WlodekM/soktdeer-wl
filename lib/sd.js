import "https://unpkg.com/eventemitter3@latest/dist/eventemitter3.umd.min.js"

export default class SoktDeer {
    /** @type {string} */
    token = '';
    /** @type {boolean} */
    loggedIn = false;
    /** @type {WebSocket} */
    ws;
    /** @type {import("node:events").EventEmitter} */
    wsEvents = new EventEmitter3();
    /** @type {any[]} */
    messages = [];
    constructor(wsUri = "wss://sokt.fraudulent.loan") {
        this.connect(wsUri);
    }

    connect(wsUri = "wss://sokt.fraudulent.loan") {
        this.ws = new WebSocket(wsUri);
        this.ws.onmessage = (rdata) => {
            const data = JSON.parse(rdata.data.toString());
            console.info("SD", "INCOMING", data);
            if (data.listener != null) return this.wsEvents.emit(`listener-${data.listener}`, data)
            if ('command' in data) return this.wsEvents.emit(data.command, data);
            if ('error' in data
                && Object.keys(data).filter(k => !['error', 'code'].includes(k)).length > 0)
                return this.wsEvents.emit(
                    Object.keys(data).filter(k => !['error', 'code'].includes(k))[0],
                    data
                )
            if ('error' in data) return this.wsEvents.emit('error', data);
        }
        this.ws.onclose = 
        this.wsEvents.on('greet', greetp => {
            this.messages = greetp.messages.reverse()
        })
        this.wsEvents.on('new_post', ({ data: post }) => {
            this.messages.push(post)
        })
        this.ws.onopen = () => setInterval(()=>this.ping.call(this), 5000)
    }

    login(username, password) {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify({
                command: "login_pswd",
                username,
                password
            }))
            this.wsEvents.once('token', ({token}) => {
                this.token = token;
                resolve(token)
            })
            this.wsEvents.once('error', error => {
                if (error.error) {
                    reject(error.code)
                }
            })
        })
    }

    //TODO - implement this
    loginToken(token, username) {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify({
                command: "login_token",
                token,
                username,
                listener: 'auth'
            }))
            this.wsEvents.once('listener-auth', ({error}) => {
                if (error.error) reject(error.code)
                else resolve(true)
            })
        })
    }

    getUser(username) {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify({
                command: "get_user",
                username
            }))
            this.wsEvents.once('user', resp => {
                if (resp.error) reject(resp.code)
                else resolve(resp.user)
            })
        })
    }
    
    post(post) {
        if(!post.replies) post.replies = [];
        if(!post.attachments) post.attachments = [];
        this.ws.send(JSON.stringify({
            command: "post",
            ...post
        }))
    }

    ping() {
        this.ws.send(JSON.stringify({ command: "ping" }))
    }
}
