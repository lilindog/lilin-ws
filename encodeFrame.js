"use strict";

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

    //isMask+payloadlen；标准规定，服务端返回的数据无需mask
    arr.push( (0<<7) + len );

    //Extended payloadlen
    if(len === 126) arr.push(dataBuf>>8), arr.push(dataBuf);
    if(len === 127) arr.push(dataBuf>>56, dataBuf>>48, dataBuf>>40, dataBuf>>32, dataBuf>>24, dataBuf>>16, dataBuf>>8, dataBuf);

    //mask（4个字节）服务端发往客户端不需要
    arr.push(dataBuf);

    return Buffer.from(arr);
  
}

module.exports = encodeFrame;