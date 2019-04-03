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

//为ws自定义事件
wss.on("connection", sock=>{

    sock.on("hello", data=>{
        console.log("来自前端hello事件：" + data);
        sock.trigger("message", data);
    });

    sock.on("fuck", data=>{
        console.log("来自前端fuck事件：" + data);
    });

    sock.on("haha", data=>{
        console.log("来自前端haha事件：" + data);
    });

});