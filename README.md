# 一个简单的nodejs websocket服务类

*几行简单的代码即可实现websocket通信*

```javascript

//测试服务器

const Wss = require("../wss.class");

let srv = new Wss();

srv.onConnection = ws=>{

    ws.onOpen = function(){
        console.log("握手成功");
        this.send("恭喜，握手成功");
    }

    ws.onMessage = function(obj, data){
        console.log(data);
        this.send("发回去：" + data);
    }

    ws.onError = function(msg){
        console.log(msg);
    }
    
    ws.onClose = function(){
        console.log("一个ws链接关闭");
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

```

## 简介

> 某一天，想做一个网页版的视频转换，后端使用ffmpeg，想通过websocket来通知前端ffmpeg处理进度；速速去npm搜了一把，忙活半天，感觉这些包都太重了。后自己决定研究一把websocket数据帧，所以诞生了这个类。


*效果如图（gif）*

![GIF效果图加载中...](./test/GIF.gif)

## 关于websocket数据帧的相关参考资料
* [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
  
*笔记后续完善*