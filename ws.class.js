"use strict";

const tools = require("./tools");
const {EventEmitter:Emt} = require("events");
const send = require("./lib/sendData");
const decode = require("./lib/decode");

module.exports = Ws;

//继承EventEmitter
tools.extend(Ws, Emt);

//socket类
function Ws(socket){
    //保存真正sock
    this.sock = socket;

    this.sock.on("data", chunk=>
    {
        this._decode(chunk);
    });

    this.sock.on("error", error=> {
        this.emit("error", error);
    });

    this.sock.on("close", ()=> {
        this.emit("destroy");
        this.emit("close", this);
    });
}

Ws.prototype._decode = decode;

//发送数据的方法
Ws.prototype._send = function(data){
    if(this.sock.destroyed) return;
    send(this.sock, data);
}

//发送ping
Ws.prototype._ping = function(){
    this._send({
        data: "",
        FIN: 1,
        opcode: 9
    });
}

//发送pong
Ws.prototype._pong = function () {
    this._send({
        data: "",
        FIN: 1,
        opcode: 10
    });
}

/*
* 与前端库lilin-wss库配合的事件触发方法
* @param eventName <String> 事件名
* @param data <String> 数据，一般是json
*/
Ws.prototype.trigger = function(eventName, data){
    //这个对象是与前端lilin-wss库约定好的
    let eventObj = {
        name: eventName,
        data: data
    }
    this._send(JSON.stringify(eventObj));
}