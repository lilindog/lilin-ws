"use strict";

//测试服务器
const http = require("http");
const Wss = require("../wss.class");

let srv = http.createServer((req, res)=>{
    res.end("test srv ...");
});


let wss = new Wss();

wss.on("connection", sock=>{
    console.log("新链接进入");
    sock.on("data", data=>{
        console.log("sock来data啦");
        console.log(data);
        console.log("发回");
        sock.send(data);
    });
    sock.on("close", ()=>{
        console.log("关闭啦");
    })
});

srv.on("upgrade", (req, socket)=>{
    if(req.url === "/socket"){
        wss.addClient(req, socket);
    }
});










srv.listen(8612, ()=>{
    console.log("http srv runing ...");
});