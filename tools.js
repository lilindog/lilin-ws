"use strict"

class Tools{

    /*
    * 继承类的函数
    * @param child <Object> 子类
    * @param parent <Object> 父类
    */
    extend(child, parent){
        function F(){};
        F.prototype = parent.prototype;
        child.prototype = new F();
        child.prototype.constructor = child;
    }

    /**
     * 生成随机key 
     * 
     * @return {String}
     */
    buildRandomKey () {
        return `server_key-${String(Math.random()).replace(/\./, "")}-${new Date().getTime()}`;
    }
}

module.exports = new Tools();