/**
 * Created by acc on 2018/3/28.
 */

class Res {
    constructor () {
        this.code = {
            success: '0000',
            loginFail: '0001',
            addBillFail: '0002'
        }
    }

    success(msg) {
        return {
            code : this.code.success,
            msg: msg
        }
    }

    error(code, msg) {
        return {
            code: code,
            msg: msg
        }
    }
}

module.exports = new Res();