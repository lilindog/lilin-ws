"use strict";

const Ws = require("../ws");

const server = new Ws(8612);

server.onOpen = ()=>{
    console.log("有新的链接");
}

server.onMessage = msg=>{
    console.log("来消息啦：" + msg);
}

server.onError = msg=>{
    console.log("错误：" + msg);
}