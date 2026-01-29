import commonApi from "@/api/common/index.js";

class LoginModel {
    userid = "cbc";
    password = "123456";

    constructor() {
    }

    // 登录逻辑
    async login() {
        const param = {
            userid: this.userid,
            password: this.password,
            sql: "gather_user.findUser"
        };

        try {
            const res = await commonApi.select(param);
            // 参考实现: if (response.data[0].objects.length > 0)
            // request.js 已经返回了 response.data，所以这里 res 应该是 response.data
            const data = res[0];
            if (data && data.objects && data.objects.length > 0) {
                // 保存用户信息
                const userid = data.objects[0].userid || data.objects[0].id;
                const userType = data.objects[0].type || 'normal';
                localStorage.setItem('loginUserid', userid);
                localStorage.setItem('userType', userType);

                // 获取客户端IP
                try {
                    const ipRes = await commonApi.getClientIP({});
                    console.log("ipRes", ipRes);
                    localStorage.setItem('clientIP', ipRes[0].ip);
                } catch (e) {
                    console.error('获取IP失败-e', e);
                    localStorage.setItem('clientIP', '');
                }

                return { success: true, user: data.objects[0] };
            } else {
                return { success: false, message: '请检查账号密码！' };
            }
        } catch (error) {
            console.error("Login request failed:", error);
            return { success: false, message: '登录请求失败' };
        }
    }
}
export default LoginModel
