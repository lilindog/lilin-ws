"use strict"


/*
* 配合 lilin-wss 模块使用的前端库 （仓库：https://github.com/lilindog/lilin-wss）
* created by lilin on 2019.4.3 15:07
*/

!function()
{
    window.Ws = Ws;
    /*
    * Evets类
    */
    function Events()
    {
        this._events = {};
    }
    Events.prototype = {
        consotructor: Events,
        //注册事件
        on: function(eventName, cb){
            if(!eventName || !cb || (typeof cb !== "function") ) throw new Error("注册事件出错");
            !this._events[eventName] && (this._events[eventName] = [cb]) || this._events[eventName].push(cb); 
        },
        //触发事件
        trigger: function(eventName, data){
            this._events[eventName] && this._events[eventName].forEach(cb=>{cb(data)});
        }
    }
    /*
    * wss类
    */
    function Ws(url)
    {
        this._reveiceEvents = new Events();
        this._url = url;
        this._sock = null;
        this._connected = false;
        this._connecting = false;//是否在连接中
        this._timer1;
        this._timer2;

        //初始化websocket
        this._init();
    }
    Ws.prototype._init = function()
    {
        this._sock = new WebSocket(this._url);
        this._keepConnect();
        this._sock.onmessage = e => 
        {
            //优先获取自定义pong回复
            if(e.data === "PONG")
            {
                console.log("PONG")
                this._timer2 && clearTimeout(this._timer2);
                return;
            }

            //然后再处理数据（自定义事件）
            try 
            {
                let eventObj = JSON.parse(e.data);
                this._reveiceEvents.trigger(eventObj.name, eventObj.data);
            } 
            catch (e)
            {
                throw new Error("Ws 底层json解析错误");
            }
        }
        this._sock.onopen = () => 
        {
            this._connected = true;
            this._connecting = false;
            this._reveiceEvents.trigger("open");
        }
        this._sock.onerror = err => 
        {
             this._reveiceEvents.trigger("error", err);
        }
        this._sock.onclose = () => 
        {
            // this.reConnect();    
        }
    }
    //执行心跳,维持链接，检测断开
    Ws.prototype._keepConnect = function()
    {
        this._timer1 = setInterval(() => 
        {
            this._sock.readyState === 1 && this._sock.send("PING");

            this._timer2 = setTimeout(() => 
            {
                clearInterval(this._timer1);    
                this._timer2 = null;
                this._connected = false;
                this._connecting = false;
                this.reConnect();

            }, 1000);//发出去的PING，1S内没有PONG回复，name就判断链接已经断开

        }, 5000);//5S为间隔PING
    }
    //重连方法
    Ws.prototype.reConnect = function()
    {
        //如果正在连接中或者已连接，直接退出
        if(this._connected || this._connecting) return;
        console.warn("[lilin-wss-client] websocket连接发生意外，正在尝试重连！");
        this._reveiceEvents.trigger("close");
        this._connected = false;
        this._connecting = true;
        this._init();
    }
    Ws.prototype.on = function(eventName, cb)
    {
        if(!eventName || !cb || (typeof cb !== "function") ) throw new Error("注册事件出错");
        this._reveiceEvents.on(eventName, cb);
    }
    Ws.prototype.trigger = function(eventName, data)
    {
        if(!this._connected)
        {
            console.error("[lilin-wss-client报错] websocket已断开，不能trigger事件！");
            return;
        }
        let eventObj = {
            name: eventName,
            data: data
        };
        this._sock.send(JSON.stringify(eventObj));
    }

}();

/*
* 修改日志
* 
* 把原来的通过浏览器websocket实例错误方法来处理重连的方式改为自己实现；因为前者亲测在远程服务器断开的时候反应非常慢
* 
* ！！！年轻的我以为在实际应用中可以通过WebSocket实例的onerror、onclose回调来触发重连机制，结果被现实狠狠的上了一课。
* 
*
*/