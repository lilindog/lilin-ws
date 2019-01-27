"use strict";

/**
 *
 * 构造websocket数据帧的函数
 * @params frame <Object> 数据帧对象
 * @return <Buffer> 返回构造好的数据帧
 * frame = {FIN: 0|1, opcode: 1|2|8, data: String|Buffer }
 * create by lilin on 2019/1/27
 */

function encodeFrame(frame){

    let 
    arr = [],
    dataBuf = Buffer.from(frame.data || ""),
    len = 0;

    if(dataBuf.length <= 125) len = dataBuf.length;
    if(dataBuf.length > 125 && dataBuf.length <= 65535) len = 126;
    if(dataBuf.length > 65535) len = 127;


    //FIN
    arr.push( ((frame.FIN || 1)<<7) + (frame.opcode || 1 ) );
    
    //isMask、payloadlen；标准规定，服务端返回的数据无需mask
    arr.push( (0<<7) + len );

    //Extended payloadlen
    if(len === 126) arr.push(dataBuf.length>>8, dataBuf.length);
    if(len === 127) arr.push(dataBuf.length>>56, dataBuf.length>>48, dataBuf.length>>40, dataBuf.length>>32, dataBuf.length>>24, dataBuf.length>>16, dataBuf.length>>8, dataBuf.length);


    //链接控制帧buffer和数据buffer，并返回
    return Buffer.concat([Buffer.from(arr), dataBuf]);
  
}

module.exports = encodeFrame;