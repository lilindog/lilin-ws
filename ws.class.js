"use strict";

/**
 * websocket类 
 */

const tools = require("./tools");
const {EventEmitter:Emt} = require("events");
const send = require("./lib/sendData");
const receive = require("./lib/receiveData");

//继承EventEmitter
tools.extend(Ws, Emt);

//socket类
function Ws(socket){

    /**
     * 想客户端发出消息接受状态反馈回掉 
     */
    this._resCallback = {};

    this.sock = socket; 

    this.sock.on("data", chunk => { 
        this._receive(chunk);
    });

    this.sock.on("error", error => {
        this.emit("error", error);
    });

    this.sock.on("close", () => {
        this.emit("destroy");
        this.emit("close", this);
    });
}

/**
 * @description 接收数据
 */
Ws.prototype._receive = receive;

/**
 * @description 发送数据 
 */
Ws.prototype._send = function(data){
    if(this.sock.destroyed) return;
    send(this.sock, data);
}

/**
 * @description 发送websocket ping 
 */
Ws.prototype._ping = function () {
    this._send({
        data: "",
        FIN: 1,
        opcode: 9
    });
}

/**
 * @description 发送websocket pong 回复
 */
Ws.prototype._pong = function () {
    this._send({
        data: "",
        FIN: 1,
        opcode: 10
    });
}

/**
 * @description 与前端库lilin-wss库配合的事件触发方法
 * @param {String} eventName 事件名
 * @param {String} data 数据，一般是json
 * @return {Promise}
 */
Ws.prototype.trigger = function (eventName, data) {
    //这个对象是与前端lilin-wss库约定好的
    const key = tools.buildRandomKey();
    let eventObj = {
        key, 
        name: eventName,
        data: data
    }
    const p = new Promise((resolve, reject) => {
        this._resCallback[key] = (is = true) => {
            is ? resolve("ok") : reject("error");
        }
    });
    const timer = setTimeout(() => {
        this._resCallback[key] && this._resCallback[key](false);
        delete this._resCallback[key];
        clearTimeout(timer);
    }, 3000);//暂定3秒
    
    this._send(JSON.stringify(eventObj));
    return p;
}

module.exports = Ws;