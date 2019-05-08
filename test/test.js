"use strict";

//测试服务器
const http = require("http");
const Wss = require("../wss.class");

let wss = new Wss();
let srv = http.createServer((req, res)=>{
    res.end("test srv ...");
});
wss.listen(srv, "/scoket");
srv.listen(8612, ()=>{
    console.log("http srv runing ...");
});




let clients = new Set([]);
//为ws自定义事件
wss.on("connection", sock=>{

    clients.add(sock);

    sock.on("login", ()=>{
        clients.add(sock);
        sock.trigger("login", "登录成功");
    });

    sock.on("close", sock=>{
        console.log("删除一个");
        clients.delete(sock);
    })

});

setInterval(() => {
    clients.forEach(sock=>{
        sock.trigger("step", new Date().getTime());
    });
}, 1000);

