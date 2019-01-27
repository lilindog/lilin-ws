"use strict";

const decode = require("./decodeFrame.js");
let buf = Buffer.from([]), str = "";

/**
 * 
 * 接受数据的函数，自动处理多帧，凑齐数据在传递给回调函数并执行 
 * @params data <Buffer> sock过来的chunk数据
 * @params callback <Function> 回调函数，接收完数据后执行，并携带解析后的数据参数
 * create by lilin on 2019/1/27
 */

function receiveData(data, callback){ 
    buf = Buffer.concat([buf, data]);
    let obj = decode(buf);
    if(obj){
        buf = Buffer.from([]);
        str += obj.data;
        if(obj.FIN === 1){
            callback && callback(str);
            str = "";
        }
    }
}

module.exports = receiveData;