"use strict"


/*
* 配合lilin-wss服务使用的库
* created by lilin on 2019.4.3 15:07
*/

!function(){
    window.Ws = Ws;
    /*
    * Evets类
    */
    function Events(){
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
    function Ws(url){
        this._reveiceEvents = new Events();

        //初始化websocket
        this._sock = new WebSocket(url);
        this._sock.onmessage = e=>{
            console.log(e);
            try{
                let eventObj = JSON.parse(e.data);
                this._reveiceEvents.trigger(eventObj.name, eventObj.data);
            }catch(e){
                throw new Error("Ws 底层json解析错误");
            }
        }
        this._sock.onopen = ()=>{
            this._reveiceEvents.trigger("open");
        }
        this._sock.onerror = err=>{
            this._reveiceEvents.trigger("error", err);
        }
        this._sock.onclose = ()=>{
            this._reveiceEvents.trigger("close");
        }
    }
    Ws.prototype.on = function(eventName, cb){
        if(!eventName || !cb || (typeof cb !== "function") ) throw new Error("注册事件出错");
        this._reveiceEvents.on(eventName, cb);
    }
    Ws.prototype.trigger = function(eventName, data){
        let eventObj = {
            name: eventName,
            data: data
        };
        this._sock.send(JSON.stringify(eventObj));
    }

}();