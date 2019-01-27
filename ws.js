const net = require("net");
const send = require("./lib/sendData");
const receive = require("./lib/receiveData");
const handshake = require("./lib/handshake");

class Ws{
    constructor(port = 8612){
        this._server = null;
        this.port = port;
        this.onOpen = null;
        this.onMessage = null;
        this.onError = null;

        this._init();
    }
    _init(){
        this._server = new net.Server();
        this._server.on("connection", sock=>{
            sock.on("data", chunk=>{
                //握手处理
                let str = chunk.toString();
                if ((/Sec-WebSocket-Key:.+/).test(str)) {
                    let key = str.match(/Sec-WebSocket-Key:.+/) && (str.match(/Sec-WebSocket-Key:.+/)[0].split(":")[1].replace(/\s/, ""));
                    handshake(sock, key)
                    .then(()=>{
                        this.onOpen && this.onOpen();
                    })
                    .catch(() => {
                        this.onError && this.onError("握手错误");
                    });
                }
                //数据处理
                else {
                    receive(chunk, data=>{
                        this.onMessage && this.onMessage(data);
                    });
                }
            });
            sock.on("error", err=>{
                this.onError && this.onError("sock错误：" + err);
            });
        });
        this._server.on("error", err=>{
            this.onError && this.onError("socket服务器错误：" + err);
        });
        this._server.listen(this.port);
    }
}

module.exports = Ws;