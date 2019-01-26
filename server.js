

const net = require("net");
const send = require("./sendData");
const receive = require("./receiveData");
const crypto = require('crypto');
const WS = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';//魔术字符串，标准说是固定的

let server = net.createServer(sock=>{

    sock.on("data", data=>{

        let str = data.toString();
        let key = str.match(/Sec-WebSocket-Key:.+/) && (str.match(/Sec-WebSocket-Key:.+/)[0].split(":")[1].replace(/\s/, ""));


        if((/Sec-WebSocket-Key:.+/).test(str)){

            sock.write('HTTP/1.1 101 Switching Protocols\r\n');
            sock.write('Upgrade: websocket\r\n');
            sock.write('Connection: Upgrade\r\n');
            sock.write('Sec-WebSocket-Accept:' + crypto.createHash('sha1').update(key + WS).digest('base64') + "\r\n");
            sock.write('\r\n');
            console.log("握手成功;连接建立。")

        }else{
            
            receive(data, function(_data){
                _data && console.log("接收到： " + _data);
                _data && send(sock, _data);
            });

        }


    });

    
    sock.on("error", err=>{
        console.log("sock出错啦");
        console.log(err);
    });


}); 
server.on("error", err=>{
    console.log("出错啦");
    console.log(err);
});
server.listen(8612, ()=>{
    console.log("started")
});

