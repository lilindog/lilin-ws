"use strict";

/**
 *
 * 解析websocket数据帧的函数
 * @buf <Buffer> 传入接收到的buf帧
 * @return <Object> 
 * 
 */ 

function decodeDataFrame(buf) {

    //1.字节数不足两位，直接退出
    if(buf.length < 2) return null;

    let frame = {}, index = 0;

    frame.FIN = buf[index]>>7;
    frame.opcode = buf[index]&parseInt(1111, 2);

    frame.hasMask = buf[++index]>>7;
    frame.len = buf[index]&parseInt(1111111, 2);
    frame.size = frame.len;

    frame.len === 126 && (frame.size = (buf[++index]<<8) + (buf[++index]) );
    frame.len === 127 && (frame.size = (buf[++index]<<56) + (buf[++index]<<48) + (buf[++index]<<40) + (buf[++index]<<32) + (buf[++index]<<24) + (buf[++index]<<16) + (buf[++index]<<8) + buf[++index] );

    frame.hasMask && (frame.mask = [buf[++index], buf[++index], buf[++index], buf[++index]] );

    //2.控制帧显示长度与实际字节长度不匹配， 直接退出
    if(buf.length < (index + frame.size) ) return null;//这里size才是控制帧计算出的时机长度， len只记录低于126的真实长度

    let arr = [];
    if(frame.hasMask){
        for(let i = 0; i < frame.size; i++){
            arr.push( buf[index+1 + i] ^ frame.mask[i % 4] );
        }
    }else{
        arr = buf.slice(index);
    }
    frame.opcode === 1 && (frame.data = Buffer.from(arr).toString("utf-8"));
    frame.opcode === 2 && (frame.data = Buffer.from(arr));

    return frame;

}

module.exports = decodeDataFrame;