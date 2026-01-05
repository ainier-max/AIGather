import request from "@/api/request";
export default {
    //查询接口
    select(data) {
        return request({
            url: "/cbc/select.cbc",
            method: "post",
            data
        });
    },
    //执行接口(增删改)
    excute(data) {
        return request({
            url: "/cbc/excute.cbc",
            method: "post",
            data
        });
    },

}