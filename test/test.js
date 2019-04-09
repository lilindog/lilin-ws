"use strict";

//测试服务器
const http = require("http");
const Wss = require("../wss.class");

let wss = new Wss();
let srv = http.createServer((req, res)=>{
    res.end("test srv ...");
});
srv.on("upgrade", (req, socket)=>{
    if(req.url === "/socket"){
        wss.addClient(req, socket);
    }
});
srv.listen(8612, ()=>{
    console.log("http srv runing ...");
});




let clients = new Set([]);
//为ws自定义事件
wss.on("connection", sock=>{

    clients.add(sock);

    sock.on("close", ()=>{
        console.log("一个sock关闭");
        clients.delete(sock);
    });

    sock.on("test", data=>{
        console.log(data);
    });

});

setInterval(() => {
    clients.forEach(sock => {
        sock.trigger("message", "hello 你好");
    });  
}, 500);

