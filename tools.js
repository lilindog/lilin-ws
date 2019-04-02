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
}

module.exports = new Tools();