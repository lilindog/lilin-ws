"use strict";

const send = require("./lib/sendData");
const receive = require("./lib/receiveData");
const handshake = require("./lib/handshake");

class Ws{
    constructor(socket){
        this.socket = socket;
        this.onOpen;
        this.onClose;
        this.onMessage;
        this.onError;
        this._init();
    }
    _init(){
        this.socket.on("data", chunk=>{
            //握手
            if (/Sec-Websocket-Key:.+/ig.test(chunk.toString())) {
                let key = chunk.toString().match(/Sec-Websocket-Key:.+/ig)[0].split(":")[1].replace(" ", "");
                handshake(this.socket, key)
                .then(()=>{
                    this.onOpen && this.onOpen();
                })
                .catch(msg=>{
                    this.onError && this.onError(msg);
                });
            } 
            //数据
            else{
                receive(chunk, (obj, data)=>{
                    //处理关闭逻辑（标准规定websocket opcode为8时代表关闭）
                    if(obj.opcode === 8){
                        this.onClose && this.onClose();
                        return;
                    }
                    this.onMessage && this.onMessage(obj, data);
                });
            }
        });
    }
    send(data){
        send(this.socket, data);
    }
}

module.exports = Ws;