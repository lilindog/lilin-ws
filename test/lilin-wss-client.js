"use strict"

/**
 * 配合 lilin-wss 模块使用的前端库 （仓库：https://github.com/lilindog/lilin-wss）
 * created by lilin on 2019.4.3 15:07
 * last update 2019/5/25
 */

!function () {
    
    /**
     * 工具集合 
     */
    const tools = {
        //生成随机key
        buildRandomKey () {
            return `key-${String(Math.random()).replace(/\./g, "")}-${new Date().getTime()}`;
        }
    }


    /**
     * 输出错误的函数 
     */
    function debug (str = "") {
        console.error("[lilin-wss-client报错]：" + str);
    }

    /**
     * Evets类
     */
    function Events () {
        this._events = {};
    }
    Events.prototype = {
        consotructor: Events,
        //注册事件
        on: function (eventName, cb) {
            if(!eventName || !cb || (typeof cb !== "function") ) throw new Error("注册事件出错");
            !this._events[eventName] && (this._events[eventName] = [cb]) || this._events[eventName].push(cb); 
        },
        //触发事件
        trigger: function (eventName, data) {
            this._events[eventName] && this._events[eventName].forEach(cb=>{cb(data)});
        }
    }

    window.Ws = Ws;

    /**
     * wss类
     */
    function Ws (url) {
        this._reveiceEvents = new Events();
        this._url = url;
        this._sock = null;

        /**
         *服务端接收成功回调事件集合 
         *
         * 结构如： {key: callback}
         */
        this._resCallBack = {};

        //链接超时定时器
        this._t1 = null, //{setTimeout}
        //创建连接超时时间
        this.timeout = 3000;
        //ping轮询定时器
        this._t2 = null; //{setInterval}
        //ping间隔时间
        this.duration = 5000;
        //链接中断判断定时器
        this.t3 = null;//{setTimeout}
        //ping pong之间最大时间
        this.delay = 3000;

        //初始化websocket
        this._init();
    }
    Ws.prototype._init = function () {   

        this._t1 = setTimeout(() => {
            clearTimeout(this._t1);
            if (this._sock.readyState !== 1) {
                debug("创建连接超时!");
                this._sock.close();
            }
        }, this.timeout);

        this._sock = new WebSocket(this._url);
        this._sock.onmessage = e => {
            //优先获取自定义pong回复
            if (e.data === "PONG") {
                this._t3 && clearTimeout(this._t3);
                return;
            }
            //然后再处理数据（自定义事件）
            try {
                let eventObj = JSON.parse(e.data);
                //发送状态回调处理
                if (eventObj.key && this._resCallBack[eventObj.key]) {
                    this._resCallBack[eventObj.key]();
                    delete this._resCallBack[eventObj.key];
                    console.log("[接收]：" + Object.keys(this._resCallBack).length);
                }
                this._reveiceEvents.trigger(eventObj.name, eventObj.data);
            } catch (e) {
                throw new Error("Ws 底层json解析错误");
            }
        }
        this._sock.onopen = () => {   
            //触发open事件
            this._reveiceEvents.trigger("open");

            //执行心跳保持连接
            this._keepConnection();
        }
        this._sock.onerror = err => {
            //这里的清除全部定时器虽然有点多余，但是有的情况下，websocket会直接触发onerror，所以不得不做处理
            this._clearKeepConnection();

            this._reveiceEvents.trigger("error");
        }
        this._sock.onclose = () => {   
            //这里的清除全部定时器虽然有点多余，但是有的情况下，websocket会直接触发onclose，所以不得不做处理
            this._clearKeepConnection();

            //触发close事件
            this._reveiceEvents.trigger("close");
            debug("正在执行重连...");
            //执行重连
            this._init();
        }
    }

    Ws.prototype._keepConnection = function() {   
        //循环发送PING
        this._t2 = setInterval(() => {   
            if (this._sock.readyState !== 1) {
                return;
            }
            //发送PING
            this._sock.send("PING");
            //如果在下一个ping发出之前没有pong回复，那么高定时器回调就执行判断链接即为中断，直接执行sock.close();
            this._t3 = setInterval(() => {
                clearInterval(this._t2);
                clearTimeout(this._t3);
                if (this._sock.readyState === 1) {
                    debug("连接已中断!");
                    this._sock.close();
                }
                
            }, this.delay);

        }, this.duration);
    }

    Ws.prototype._clearKeepConnection = function () {
        clearInterval(this._t2);
        clearTimeout(this._t3);
    }

    Ws.prototype.on = function (eventName, cb) {
        if (!eventName || !cb || (typeof cb !== "function") ) throw new Error("注册事件出错");
        this._reveiceEvents.on(eventName, cb);
    }

    /**
     * 向后端发送事件 
     * 
     * @return {Promise}
     */
    Ws.prototype.trigger = function (eventName, data) {
        if (this._sock.readyState !== 1) {
            return;
        }
        const 
        key = tools.buildRandomKey(),
        eventObj = {
            key,
            name: eventName,
            data: data
        };
        this._sock.send(JSON.stringify(eventObj));
        //发送消息超时没有回复时， 执行发送状态回调
        setTimeout(() => {
            //其实这里可以在返回状态的时候来销毁这个回调，更优雅。 这里暂时就这样简单处理了
            this._resCallBack[key] && this._resCallBack[key](false);
            delete this._resCallBack[key];
        }, this.timeout);
        return new Promise((resolve, reject) => {
            this._resCallBack[key] = function (is = true) {
                is ? resolve("ok") : reject("error");
            }
            console.log("[发送]：" + Object.keys(this._resCallBack).length);
        });
    }

}();