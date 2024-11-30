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
    constructor (wsUri="wss://sokt.meltland.dev") {
        this.ws = new WebSocket(wsUri);
        this.ws.onmessage = (rdata) => {
            const data = JSON.parse(rdata.data.toString());
            console.info("SD", "INCOMING", data)
            if ('token' in data) return this.wsEvents.emit('token', data.token);
            if ('command' in data) return this.wsEvents.emit(data.command, data);
            if ('error' in data) return this.wsEvents.emit('error', data);
        }
        this.wsEvents.on('greet', greetp => {
            this.messages = greetp.messages
        })
        this.wsEvents.on('new_post', ({data: post}) => {
            this.messages.push(post)
        })
    }
    login(username, password) {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify({
                command: "login_pswd",
                username,
                password
            }))
            this.wsEvents.once('token', token => {
                this.token = token;
                resolve(token)
            })
            this.wsEvents.once('error', error => {
                if(error.error) {
                    reject(error.code)
                }
            })
        })
    }
    loginToken(token) {
        return new Promise((resolve, reject) => {
            this.ws.send(JSON.stringify({
                command: "login_token",
                token
            }))
            this.wsEvents.once('error', error => {
                if(error.error) reject(error.code)
                else resolve()
            })
        })
    }
}