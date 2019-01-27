"use strict";

const Ws = require("../ws");

const server = new Ws(8612);

server.onOpen = sock=>{
    // console.log(sock);
    console.log("有新的链接");
}

server.onMessage = (sock, msg)=>{
    // console.log(sock);
    console.log("来消息啦：" + msg);
}

server.onError = msg=>{
    console.log("错误：" + msg);
}