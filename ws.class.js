"use strict";

const tools = require("./tools");
const {EventEmitter:Emt} = require("events");
const send = require("./lib/sendData");
const receive = require("./lib/receiveData");

module.exports = Ws;

//继承EventEmitter
tools.extend(Ws, Emt);

//socket类
function Ws(socket){
    //保存真正sock
    this.sock = socket;

    this.sock.on("data", chunk=>{
    
        receive(chunk, (obj, str)=>{
            
            //接收到ping时直接发回pong
            if(obj.opcode === 9){
                this.send({
                    data: "",
                    FIN: 1,
                    opcode: 10
                });
                return;
            }
            //opcode为8，直接触发ws关闭
            if(obj.opcode === 8){
                this.emit("close");
                return;
            }
            //接收数据
            this.emit("data", str);
        });

    });

    this.sock.on("error", error=> {
        this.emit("error", error);
    });

    this.sock.on("close", ()=> {
        this.emit("destroy");
        this.emit("close");
    });
}

//发送数据的方法
Ws.prototype.send = function(data){
    send(this.sock, data);
}

//发送ping
Ws.prototype.ping = function(){
    send(this.sock, {
        data: "",
        FIN: 1,
        opcode: 9
    });
}

//发送pong
Ws.prototype.pong = function () {
    send(this.sock, {
        data: "",
        FIN: 1,
        opcode: 10
    });
}