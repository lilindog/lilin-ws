*这是dev版本，目前修改了头疼1周以上的tcp粘包问题，目前测试没有任何问题，下一步还需要进行封装！*
# 一个简单的nodejs websocket服务类

## 使用示例

### 后端代码
```js

/*
* http原生
*/
const http = require("http");
const Wss = require("./lilin-wss/Wss.class.js");
let wss = new Wss();
let srv = http.createServer();
srv.listen(80);
srv.on("upgrade", (req, socket)=>{
    wss.addClient(req, socket);
});

wss.on("connection", sock=>{

    //为ws自定义事件
    ws.on("helloServer", data=>{
        console.log(data);
    });
    //...more

    //也可以向前端发送事件
    ws.trigger("helloWeb", "不跑路，也不删库");

})

```

```js

/*
* 使用express
*/
const http = require("http");
const express = require("express");
const Wss = require("../wss.class");

let wss = new Wss();
let app = express();
let srv = http.createServer(app);
srv.on("upgrade", (req, socket)=>{
    wss.addClient(req, socket);
});
srv.listen(80);

wss.on("connection", sock=>{

    //为ws自定义事件
    ws.on("helloServer", data=>{
        console.log(data);
    });
    //...more

    //也可以向前端发送事件
    ws.trigger("helloWeb", "不跑路，也不删库");

});



```
### 前端代码

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>websocket_test</title>
</head>
<body>
</body>
<!-- 这个类必须在你使用websocket的代码前引入 -->
<script src="./lilin-wss-client.js"></script>
<script>
    //实例化一个ws对象
    let ws = new Ws("ws://127.0.0.1:8612/socket");
    //连接事件
    ws.on("open", ()=>{
        console.log("已建立socket链接");
    //自定义事件,后端trigger该事件时前端会收到消息
    ws.on("helloWeb", data=>{
        console.log("来数据啦：");
        console.log(data);
    });
    //想后端发一个自定义事件，后端按相同的事件名接收
    ws.trigger("helloServer", {
        msg: "删库跑路不？"
    });
    //...more

</script>
</html>

```

## bug/tips
* 暂时未考虑二进制文件的发送与接收。
* 后端发大体积数据到前段时候，后端没做websocket分帧（分片），当发送大体积数据时会影响整个网速，建议单个事件数据小于100000byte（10kb左右）最好。
* 暂未实现单独创建websocket服务器;将在后续维护中实现。

## 关于websocket数据帧的相关参考资料
* [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
  
*是不是非常的简单呢，水平有限，欢迎指点和star*
