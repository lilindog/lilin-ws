# 一个简单的nodejs websocket服务类

## 简介

> 某一天，想做一个网页版的视频转换，后端使用ffmpeg，想通过websocket来通知前端ffmpeg处理进度；速速去npm搜了一把，忙活半天，感觉这些包都太重了。后自己决定研究一把websocket数据帧，所以诞生了这个类。


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

## Wss类
>通过new Wss创建一个websocket服务器对象
>```javascript
>let srv = new Wss();
>//不需要参数，返回一个websocket对象实例
>```
>启动wensocket服务
>```javascript
>srv.listen(8080, ()=>{
>    console.log("服务启动啦，运行在8080端口...");
>});
>//端口号参数为必选，回调函数可选，回调函数会在服务启动成功后执行
>```
>处理服务器连接事件
>```javascript
>//每当有新的websocket链接进来的时候，都会触发该事件
>srv.onConnections = function(ws){
>   //回调里边仅有一个参数传入，那就是当前的连接对象ws
>   //ws对象是每个用户的链接（它的具体事件属性以及方法，请参考下面的ws类）    
>   //这里简单的处理ws对象发过来的信息
>   ws.onMessage = function(frame, data){
>       console.log("客户端发过来的数据是：" + data); 
>       //给客户端发回去
>       this.send("你的消息我收到啦");
>   }   
>}
>```
>处理服务器错误事件
>```javascript
>srv.onError = function(errMsg){
>   console.log("服务器发生错误：" + errMsg);
>}
>```
>处理服务器关闭事件
>```javascript
>srv.onClose = function(){
>   console.log("服务器已经关闭了");
>}
>```
>wss服务器connections属性
>```javascript
>srv.connections <Set> //存放所有的用户连接，做广播的时候会用到
>```


## ws类
>每当wss实例触发onConnection事件的时候，会往事件回调里传递一个ws实例，ws实例是每个用户的链接，可以处理信息发送，接收等等
>
>ws握手事件
>```javascript
>ws.onOpen = function(){
>   console.log("有新的websocket链接建立，并握手成功");
>}
>```
>ws关闭事件
>```javascript
>ws.onClose = function(){
>   console.log("有一个用户连接关闭");
>}
>```
>ws错误事件
>```javascript
>ws.onError = function(errMsg){
>   console.log("有一个用户连接发生错误：" + errMsg);
>}
>```
>ws消息事件（接收消息）
>```javascript
>ws.onMessage = function(frame, data){
>   console.log("客户端来消息啦：" + data);
>   //frame参数为当前接收的websocket数据帧对象， data参数为接收到的消息
>}
>```
>ws发送消息
>```javascript
>let msg = "你好啊，客户端";
>ws.send(msg);
>```

*效果如图（gif）*

![GIF效果图加载中...](./test/GIF.gif)

## 关于websocket数据帧的相关参考资料
* [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSockets_API/Writing_WebSocket_servers)
  
*是不是非常的简单呢，水平有限，欢迎指点和star*