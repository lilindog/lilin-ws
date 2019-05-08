/*
* 解析数据帧的函数
* 根据帧头获取数据大小，解析完一帧后再返回，多帧数据需要在外部组合
* @param buf <Buffer> data事件的chunk
* @return <Object> 例如{FIN:1,len:127,size: 1000, data:""}
*
* 最后修改于 2019/4/1 凌晨0:04 （暂时完美）
* 最后修改于 2019/4/21 晚上20:26 （修复了头疼了一个礼拜的神奇bug）
*/

module.exports = decode;

/*
* 用于保存chunk数据的buffer
*/
let totalBuf = Buffer.from([]);

/*
* 解析函数
*/
function decode(chunk){
	let 
	index = 0,
	frame = {
		FIN: null,
		opcode: null,
		mask: null,
		len: 125,
		size: null,
		data: ""
	};
	//累加chunk
	chunk && addBuf(chunk);
	//检查最低字节数量（第一字节和第二字节）
	if(totalBuf.length < 2){
		index = 0;
		return false;
	}
	//解析FIN
	frame.FIN = totalBuf[index] >> 7;
	
	//解析opcode
	frame.opcode = totalBuf[index] & parseInt("00001111",2);
	
	//解析mask
	frame.mask = totalBuf[++index] >> 7;
	
	//解析len
	frame.len = totalBuf[index] & parseInt(1111111, 2);
	frame.size = frame.len;
	
	//获取超出125的长度
	if(frame.len === 126){
		if(totalBuf.length < index + 1 + 2) return false;
		frame.size = (totalBuf[++index] << 8) + totalBuf[++index];
	}
	if(frame.len === 127){
		if(totalBuf.length < index + 1 + 8) return false;
		index += 4;//前4个零暂不理会
		frame.size = (totalBuf[++index]<<24) + (totalBuf[++index]<<16) + (totalBuf[++index]<<8) + totalBuf[++index];
	}
	
	//获取mask
	if(frame.mask){
		if(totalBuf.length < index + 1 + 4) return false;
		frame.mask = [
			totalBuf[++index],
			totalBuf[++index],
			totalBuf[++index],
			totalBuf[++index]
		];
	}

	//检查数据载荷长度
	if(totalBuf.length < (index + 1 + frame.size) ) return false;

	//解析数据
	if(frame.mask){
		//buffer.slice()方法，第一个参数为起始索引，第二个参数为结束截止索引（不含）默认为buf.length
		let playLoad = totalBuf.slice(index + 1, index + frame.size + 1), arr = [], _ = null;
		
		for(let i = 0; i < playLoad.length; i++){
			_ = playLoad[i] ^ frame.mask[i % 4];
			arr.push(_);
		}
		frame.data = Buffer.from(arr).toString();
	}else{
		let _ = totalBuf.slice(index + 1, index + frame.size + 1);
		frame.data = Buffer.from(_).toString();
	}
	totalBuf = totalBuf.slice(index + frame.size + 1);

	/*
	* 收到tcp粘包问题困扰了1周后。
	* 这里判断，如果一个data事件中存在2个或以上数据帧时，进行递归解析
	*/
	// console.log("还剩余："+totalBuf.length);
	receiveData.call(this, frame);

	//没完，继续递归
	if(totalBuf.length > 0) decode.call(this);
}

/*
* 连接buffer的函数，将新buffer追加到旧buffer里边
* @parm newBuf <Buffer> 新的buffer
*/
function addBuf(newBuf){
	totalBuf = Buffer.concat([totalBuf, newBuf]);
}










//==================================================================>
// 这里吧之前的receiveData函数里的逻辑搬到了这里
// 负责分帧的合并
//==================================================================<
let str = "";
function receiveData (frame){
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
		if(frame.data === "PING")
		{
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
		this.emit(eventObj.name, eventObj.data);

		str = "";
	}
}