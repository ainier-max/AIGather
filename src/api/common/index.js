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
    //批量执行接口
    excuteByBatch(data) {
        return request({
            url: "/cbc/excuteByBatch.cbc",
            method: "post",
            data
        });
    },
    //刷新Mapper(修改命名空间)
    mapperRefreshByEditNameSpace(data) {
        return request({
            url: "/cbc/mapperRefreshByEditNameSpace.cbc",
            method: "post",
            data
        });
    },
    //刷新Mapper
    mapperRefresh(data) {
        return request({
            url: "/cbc/mapperRefresh.cbc",
            method: "post",
            data
        });
    },
    //刷新Mapper(删除命名空间)
    mapperRefreshByDeleteNameSpace(data) {
        return request({
            url: "/cbc/mapperRefreshByDeleteNameSpace.cbc",
            method: "post",
            data
        });
    },
    //文件上传接口
    uploadFile(data) {
        return request({
            url: "/cbc/upload.cbc",
            method: "post",
            data
        });
    },
    //文件删除接口
    deleteFile(data) {
        return request({
            url: "/cbc/deleteFile.cbc",
            method: "post",
            data
        });
    },
    //获取文件URL
    getFileUrl(uuid, type) {
        return `/cbc/getFile.cbc?uuid=${uuid}&type=${type}`;
    },
    //获取客户端IP
    getClientIP(query) {
        return request({
            url: `/cbc/getClientIP.cbc`,
            method: 'get',
            params: query
        })
    }

}