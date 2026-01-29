
/**
 * MVC中的Model层,主要用来处理逻辑，Model会有多个业务逻辑类
 */
class ModelClass {
    //参数可提取到这里
    color = '';
    name = "小白";
    constructor() {

    }
    changeName() {
        this.name = "小红";
    }
}
export default ModelClass