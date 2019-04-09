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
            //接收到pong时不理会
            if(obj.opcode === 10){
                return;
            }
            //接收数据
            try{
                var eventObj = JSON.parse(str);
                this.emit(eventObj.name, eventObj.data);
            }catch(e){
                console.log("没能解析前端封装的json");
                console.log(str);
            }
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
Ws.prototype._send = function(data){
    send(this.sock, data);
}

//发送ping
Ws.prototype._ping = function(){
    send(this.sock, {
        data: "",
        FIN: 1,
        opcode: 9
    });
}

//发送pong
Ws.prototype._pong = function () {
    send(this.sock, {
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