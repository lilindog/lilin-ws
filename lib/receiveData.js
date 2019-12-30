"use strict"

/**
 * 接收并合并数据帧
 * 
 * 最后修改于 2019/7/28 晚上20:08 (重新调整，把receive逻辑抽离出来) 
 */

const decode = require("./decode");

/**
 * @description 累积保存合并的文本数据 
 */
let str = "";

/**
 * @description 接收、合并数据帧对象中的数据
 * @param {Buffer} chunk 来自套接字message事件的数据块
 */
function receiveData (chunk) {
    decode.call(this, chunk, mergeHandler);
}

/**
 * @description 合并处理帧数据，以及心跳处理
 * @param {Object} frame decode处理后的frame对象
 */
function mergeHandler (frame) {
    str += frame.data;
	if (frame.FIN === 1) {
		frame.size = str.length;
		frame.data = str;
        // console.log(frame);
		//接收到ping时直接发回pong
		if (frame.opcode === 9) {
			str = "";
			this._send({
				data: "",
				FIN: 1,
				opcode: 10
			});
			return;
		}
		//opcode为8，直接触发ws关闭
		if (frame.opcode === 8) {
			str = "";
			this.emit("close", this);
			return;
		}
		//接收到pong时不理会
		if (frame.opcode === 10) {
			str = "";
			return;
		}
		//拦截自定义PING，并发回约定好的PONG
		if (frame.data === "PING") {
			console.log("PING")
			this._send({
				data: "PONG",
				FIN: 1,
				opcode: 1,
			});
			str = "";
			return;
		}

		//接收数据
		try {
			var eventObj = JSON.parse(str);
		} catch (e) {
			console.log("没能解析前端封装的json");
			console.log(str);
		}

		if (Reflect.has(eventObj, "key")) {
			const key = eventObj.key;

			//服务端回复状态回掉处理
			if (/server_key/.test(key) && this._resCallback[key]) {
				this._resCallback[key]();
				delete this._resCallback[key];
			}
			
			//客户端发送状态回馈
			if (/client_key/.test(key)) {
				eventObj.key && this._send(JSON.stringify({
					key: eventObj.key,
					// name: eventName,
					// data: data
				}));
			}
		}

		Reflect.has(eventObj, "name") && this.emit(eventObj.name, eventObj.data);
		str = "";
	}
}

module.exports = receiveData;