/**
 * Created by acc on 2018/3/28.
 */

/**
 * 响应
 */
class Res {
    /**
     * 构造
     */
    constructor() {
        this.code = {
            success: '0000',
            loginFail: '0001',
            addBillFail: '0002',
            updateBillFail: '0003',
            powerFail: '0004',
            paramsMiss: '0005',
            delFail: '0006',
            getLogInfoErr: '0007',
            updateBillInfoFail: '0008',
            loginOutTime: '0009'
        };
    }

    /**
     * 成功返回
     * @param {*} msg
     * @return {{code: string, msg: *}}
     */
    success(msg) {
        return {
            code: this.code.success,
            msg: msg,
        };
    }

    /**
     * 错误返回
     * @param {number} code
     * @param {*} msg
     * @return {{code: *, msg: *}}
     */
    error(code, msg) {
        return {
            code: code,
            msg: msg,
        };
    }
};

module.exports = new Res();