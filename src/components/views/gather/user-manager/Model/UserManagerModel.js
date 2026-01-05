/**
 * MVC中的Model层
 */
import commonApi from "@/api/common/index.js";

class UserManagerModel {
    userData = [];

    constructor() {
    }

    async findAllUser() {
        const param = {
            sql: "gather_user.findUser"
        };
        try {
            const res = await commonApi.select(param);
            if (res && res.length > 0 && res[0].state === "success") {
                this.userData = res[0].objects;
            } else {
                this.userData = [];
            }
        } catch (error) {
            console.error(error);
            this.userData = [];
        }
    }
}

export default UserManagerModel;
