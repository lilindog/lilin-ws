"use strict"

const Ws= require("./ws.class");
const tools = require("./tools");
const handshake = require("./lib/handshake");
const {EventEmitter:Emt} = require("events");

module.exports = Wss;

tools.extend(Wss, Emt);

function Wss(){
    //客户端集合,用于自己发送心跳，维护链接
    this.clients = new Set([]);
    //保持心跳
    this._holdConnection();
}
//添加客户端
Wss.prototype.addClient = function(req, socket){

    //有websocket请求头
    let key = "";
    for(let i =0; i < req.rawHeaders.length; i++){
        if(req.rawHeaders[i] === "Sec-WebSocket-Key"){
            key = req.rawHeaders[i + 1];
            break;
        }
    }

    if(!key) return;
    handshake(socket, key);

    let _socket = new Ws(socket);
    _socket.on("close", ()=>{
        this.clients.delete(_socket);
    });
    this.clients.add(_socket);
    this.emit("connection", _socket);
}
Wss.prototype._holdConnection = function(){
    setInterval(() => {
        this.clients.forEach(sock => {
            sock._ping();
        });
    }, 10000);
}
