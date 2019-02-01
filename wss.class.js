const net = require("net");
const Ws = require("./ws.class");

class Wss{
    constructor(){
        this._server;
        this.connections = new Set([]);
        this.onConnection;
        this.onError;
        this.onClose;
        this._init();
    }
    _init(){
        this._server = new net.Server();
        this._server.on("connection", sock=>{
            let ws = new Ws(sock);
            this.connections.add(ws);
            this.onConnection && this.onConnection(ws);
        });
        this._server.on("error", err=>{
            if(this.onError){
                this.onError(err);
            }else{
                console.log(err);
                process.exit();
            }
        });
        this._server.on("close", ()=>{
            this.onClose && this.onClose();
        });
    }
    listen(port, func){
        this._server.listen(port, ()=>{
            func && func();
        });
    }
}

module.exports = Wss;