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

}