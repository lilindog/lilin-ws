

const net = require("net");
const decode = require("./decodeFrame");
const encode = require("./encodeFrame");


var crypto = require('crypto');
var WS = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';//魔术字符串，标准说是固定的

let server = net.createServer(sock=>{

    let buffer = Buffer.from([]);

    sock.on("data", data=>{


        let str = data.toString();
        let key = str.match(/Sec-WebSocket-Key:.+/) && (str.match(/Sec-WebSocket-Key:.+/)[0].split(":")[1].replace(/\s/, ""));


        if((/Sec-WebSocket-Key:.+/).test(str)){

            sock.write('HTTP/1.1 101 Switching Protocols\r\n');
            sock.write('Upgrade: websocket\r\n');
            sock.write('Connection: Upgrade\r\n');
            sock.write('Sec-WebSocket-Accept:' + crypto.createHash('sha1').update(key + WS).digest('base64') + "\r\n");
            sock.write('\r\n');

        }else{
            
            //累积data
            buffer = Buffer.concat([buffer, data]);
            //获取data处理结果（可能是返回的数据对象，也可能是null）
            let f = decode(buffer);
            //解析成功，显示数据，清空data累计
            if(f){
                console.log(f);
                buffer = Buffer.from([]);

                //console.log(encode({data:"okok"}))
                sock.write(encode({
                    data: "okokok"
                }));
            }
            
            

        }


    });

    
    sock.on("error", ()=>{
        console.log("sock出错啦");
    });


}); 
server.on("error", ()=>{
    console.log("出错啦");
});
server.listen(80, ()=>{
    console.log("started")
});

