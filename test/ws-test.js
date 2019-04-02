"use strict";

//测试服务器

const Wss = require("../wss.class");

let srv = new Wss();

srv.onConnection = ws=>{

    ws.onOpen = function(){
        console.log("握手成功");
        this.send("恭喜，握手成功");
    }

    ws.onMessage = function(obj, data){
        obj.data = "...";
        console.log(obj);
        console.log("-------------------")

        //广播
        srv.connections.forEach(ws=>{
            ws.send(data);
        });
    }

    ws.onError = function(msg){
        console.log(msg);
    }
    
    ws.onClose = function(){
        console.log("一个ws链接关闭");
        srv.connections.delete(this);
    }
};

srv.onError = msg=>{
    console.log("ws服务器出错："+msg);
}

srv.onClose = ()=> {
    console.log("ws服务器关闭");
}

srv.listen(8612, ()=>{
    console.log("ws服务启动...");
});