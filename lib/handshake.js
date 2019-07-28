"use strict";

const crypto = require('crypto');
const magickStr = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';//魔术字符串，标准说是固定的

/**
 * 
 * @description 处理握手的函数
 * @params sock <Object> socket对象
 * @params key <String> 前端过来的握手key
 * @return promise
 * 
 */
function handshake (sock, key) {

    async function action () {
        await new Promise((resolve, reject)=>{
            sock.write('HTTP/1.1 101 Switching Protocols\r\n', err=>{err ? reject() : resolve()});
        });
        await new Promise((resolve, reject) => {
            sock.write('Upgrade: websocket\r\n', err => { err ? reject() : resolve() });
        });
        await new Promise((resolve, reject) => {
            sock.write('Connection: Upgrade\r\n', err => { err ? reject() : resolve() });
        });
        await new Promise((resolve, reject) => {
            sock.write('Sec-WebSocket-Accept:' + crypto.createHash('sha1').update(key + magickStr).digest('base64') + "\r\n", err => { err ? reject() : resolve() });
        });
        await new Promise((resolve, reject) => {
            sock.write('\r\n', err => { err ? reject() : resolve() });
        });
    }

    return action();

}

module.exports = handshake;