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

    sock.on("hello", data=>
    {
        console.log(data);
    });

    sock.on("close", sock=>
    {
        console.log("删除一个客户端")
        clients.delete(sock);
    });

});

let index = 0;
setInterval(() => {
    index++;
    clients.forEach(sock=>{
        sock.trigger("hello2", "你好前端"+index);
    });
}, 1000);

