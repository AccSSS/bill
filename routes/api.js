const router = require('koa-router')();
const response = require('./config');
const model = require('../lib/mysql.js');
const moment = require('moment');
const checkNotLogin = require('../middlewares/check.js').checkNotLogin;
const apiCheckLogin = require('../middlewares/check.js').apiCheckLogin;
const options = require('../public/config/config');

router.prefix('/api');

/**
 * 登录
 */
router.get('/login', async(ctx, next) => {
    let body = {};
    let username = ctx.query.username;
    let password = ctx.query.password;
    await model.findUserData(username)
        .then((result) => {
            let res = result[0];
            console.log(result)
            if (res && password === res['password']) {
                ctx.session.user = res['username'];
                ctx.session.id = res['id'];
                ctx.session.groupId = res['group_id'];

                body = response.success('登录成功');
            } else {
                body = response.error(response.code.loginFail, '用户名或密码错误');
            }
        }).catch((err) => {
            console.log(err);
        });

    ctx.body = body;
});

/**
 * 退出
 */
router.get('/signout', async(ctx, next) => {
    ctx.session = null;
    ctx.body = response.success('退出成功');
});

/**
 * 获取首页数据
 */
router.get('/getMainData', async(ctx, next) => {
    let status = await apiCheckLogin(ctx);
    if (!status) {
        ctx.body = response.error(response.code.loginOutTime, '登录超时');
        return;
    }

    let billList = [];
    let sum = '';
    let per = '';
    let groupId = ctx.session.groupId;
    await model.findAllBill(groupId).then((result) => {
        billList = result;
    });

    for (let i = 0; i < billList.length; i++) {
        billList[i].time = moment(billList[i].time).format('YYYY-MM-DD');

        for (let j = 0; j < options.length; j++) {
            if (options[j].key.toString() === billList[i].type) {
                billList[i].type = options[j].value;
            }
        }

        if (billList[i].userid === ctx.session.id) {
            billList[i].handle = true;
        }
    }

    await model.sumBill(groupId).then((result) => {
        sum = Math.round(Number(result[0]['sum(money)']) * 100) / 100;
    });

    await model.userTotal(groupId).then((result) => {
        per = Math.round(sum / result[0]['count(*)'] * 100) / 100;
    });


    ctx.body = response.success({
        user: ctx.session.user,
        billList: billList,
        sum: sum,
        per: per ? per : 0,
    })
});

/**
 * 获取账单类型
 */
router.get('/getBillType', async(ctx, next) => {
    let status = await apiCheckLogin(ctx);
    if (!status) {
        ctx.body = response.error(response.code.loginOutTime, '登录超时');
        return;
    }

    ctx.body = response.success(options)
})

/**
 * 添加账单
 */
router.get('/addBill', async(ctx, next) => {
    let status = await apiCheckLogin(ctx);
    if (!status) {
        ctx.body = response.error(response.code.loginOutTime, '登录超时');
        return;
    }

    let query = {};
    if (ctx.query.time && ctx.query.type && ctx.query.money) {
        query.time = ctx.query.time;
        query.type = ctx.query.type;
        query.money = ctx.query.money;
        query.userid = ctx.session.id;
        query.username = ctx.session.user;
        query.descr = ctx.query.descr ? ctx.query.descr : '';
        query.group_id = ctx.session.groupId;
    }

    await model.insertBill(query).then((result) => {
        ctx.body = response.success('添加成功');
    }).catch((err) => {
        ctx.body = response.error(response.code.addBillFail, '添加失败');
        console.log(err);
    });
});

/**
 * 获取账单详情
 */
router.get('/getBillLogInfo', async(ctx, next) => {
    let status = await apiCheckLogin(ctx);
    if (!status) {
        ctx.body = response.error(response.code.loginOutTime, '登录超时');
        return;
    }

    if (!ctx.query.id) {
        ctx.body = response.error(response.code.paramsMiss, '参数缺失');
        return;
    }

    let id = ctx.query.id;

    await model.getBillLogInfo(id).then((result) => {
        let res = result;
        if (res[0]) {
            for (let j = 0; j < options.length; j++) {
                if (options[j].key.toString() === res[0].type) {
                    res[0].typeName = options[j].value;
                }
            }

            ctx.body = response.success(res[0]);
        }
    }).catch((err) => {
        ctx.body = response.error(response.code.getLogInfoErr, '获取记录失败');
        console.log(err);
    });
});

/**
 * 更新账单
 */
router.get('/updateBillLogInfo', async(ctx, next) => {
    let status = await apiCheckLogin(ctx);
    if (!status) {
        ctx.body = response.error(response.code.loginOutTime, '登录超时');
        return;
    }

    if (!ctx.query.id) {
        ctx.body = response.error(response.code.paramsMiss, '参数缺失');
        return;
    }
    let id = ctx.query.id;
    let data = {
        money: ctx.query.money,
        time: ctx.query.time,
        type: ctx.query.type,
        descr: ctx.query.descr,
    };
    console.log(ctx.query);
    await model.updateBillLogInfo(id, data).then((result) => {
        ctx.body = response.success('更新成功');
    }).catch((err) => {
        ctx.body = response.error(response.code.updateBillInfoFail, '更新记录失败');
        console.log(err);
    });
});

/**
 * 删除账单
 */
router.get('/delBillLog', async(ctx, next) => {
    let status = await apiCheckLogin(ctx);
    if (!status) {
        ctx.body = response.error(response.code.loginOutTime, '登录超时');
        return;
    }

    if (!ctx.query.id) {
        ctx.body = response.error(response.code.paramsMiss, '参数缺失');
        return;
    }

    let id = ctx.query.id;

    await model.delBillLog(id).then((result) => {
        ctx.body = response.success('删除成功');
    }).catch((err) => {
        ctx.body = response.error(response.code.delFail, '删除失败');
        console.log(err);
    });
});

/**
 * 结算
 */
router.get('/getPerData', async(ctx, next) => {
    let status = await apiCheckLogin(ctx);
    if (!status) {
        ctx.body = response.error(response.code.loginOutTime, '登录超时');
        return;
    }

    let sum = '';
    let per = '';
    let users = [];
    let bills = [];
    let perList = [];
    let groupId = ctx.session.groupId;

    await model.sumBill(groupId).then((result) => {
        sum = Number(result[0]['sum(money)']);
    });

    await model.userTotal(groupId).then((result) => {
        per = Math.round(sum / result[0]['count(*)'] * 100) / 100;
    });

    await model.findAllUser(groupId).then((result) => {
        users = result;
    });

    await model.sumBillGroupByUser(groupId).then((result) => {
        bills = result;
    });

    for (let i = 0; i < users.length; i++) {
        let perItem = {
            username: users[i].username,
            per: per,
            perpay: 0,
        };

        for (let j = 0; j < bills.length; j++) {
            if (users[i].id === bills[j].userid) {
                perItem.perpay = Math.round(bills[j].perpay * 100) / 100;
            }
        }

        perList.push(perItem);
    }

    ctx.body = response.success(perList);
});

/**
 * 结算账单
 */
router.get('/updateBillStatus', async(ctx, next) => {
    let power = 0;
    let groupId = ctx.session.groupId;
    await model.findUserDataById(ctx.session.id)
        .then((result) => {
            console.log(result);
            if (result[0].admin.toString() === '1') {
                power = 1;
            } else {
                ctx.body = response.error(response.code.powerFail, '权限不足');
            }
        }).catch((err) => {
            console.log(err);
        });

    if (!power) return;

    await model.updateBillStatus(groupId).then((result) => {
        ctx.body = response.success('结算成功');
    }).catch((err) => {
        ctx.body = response.error(response.code.updateBillFail, '结算失败');
        console.log(err);
    });
});

module.exports = router;