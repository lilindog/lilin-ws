"use strict"

const Ws= require("./ws.class");
const tools = require("./tools");
const handshake = require("./lib/handshake");
const {EventEmitter:Emt} = require("events");
const {Server} = require("http");
const {parse} = require("url");

module.exports = Wss;
tools.extend(Wss, Emt);
function Wss(){}
//添加客户端
Wss.prototype.addClient = function(req, socket){
    //有websocket请求头
    let key = "";
    for(let i =0; i < req.rawHeaders.length; i++)
    {
        if(req.rawHeaders[i] === "Sec-WebSocket-Key")
        {
            key = req.rawHeaders[i + 1];
            break;
        }
    }

    if(!key) return;
    handshake(socket, key);

    let _socket = new Ws(socket);
    this.emit("connection", _socket);
}
//监听方法
Wss.prototype.listen = function(srv, path)
{
    if(!(srv instanceof Server))
    {
        throw "wss listen方法需要接收一个http.Server实例才能运行！";
    }
    //监听升级事件，获取socket并握手
    srv.on("upgrade", (req, socket) => 
    {
        if(!path)
        {
            this.addClient(req, socket);
            return;
        }

        let {pathname} = parse(req.url);
        if(~req.url.indexOf(pathname)) 
        {
            this.addClient(req, socket);
        }

    });
}
