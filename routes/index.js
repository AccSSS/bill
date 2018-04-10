const router = require('koa-router')()
const response = require('./config');
const model = require('../lib/mysql.js')
const moment = require('moment')
const checkNotLogin = require('../middlewares/check.js').checkNotLogin
const checkLogin = require('../middlewares/check.js').checkLogin
const options = require('../public/config/config');


router.get('/', async (ctx, next) => {
    await checkNotLogin(ctx)
    await ctx.render('index', {
        title: 'index'
    })
})

router.get('/index', async (ctx, next) => {
    await checkNotLogin(ctx)
    await ctx.render('index', {
        title: 'index'
    })
})

router.get('/login', async (ctx, next) => {
    let body = {};

    let username = ctx.query.username,
        password = ctx.query.password;

    await model.findUserData(username)
        .then(result => {
            let res = result;
            if (res[0] && username === res[0]['username'] && password === res[0]['password']) {
                ctx.session.user = res[0]['username']
                ctx.session.id = res[0]['id']
                ctx.session.groupId = res[0]['group_id']

                body = response.success('登录成功')
            } else {
                body = response.error(response.code.loginFail, '用户名或密码错误');
            }

        }).catch(err => {
            console.log(err)
        })

    ctx.body = body;
})

router.get('/signout', async(ctx, next) => {
    ctx.session = null;
    ctx.redirect('/index');

})

router.get('/main', async (ctx, next) => {
    await checkLogin(ctx);

    let billList = [],
        sum = '',
        per = '',
        groupId = ctx.session.groupId
    await model.findAllBill(groupId).then( result => {
        billList = result;
    })

    for(let i = 0; i < billList.length; i ++) {
        billList[i].time = moment(billList[i].time).format('YYYY-MM-DD')

        for(let j = 0; j < options.length; j ++) {
            if(options[j].key.toString() === billList[i].type) {
                billList[i].type = options[j].value
            }
        }
    }
    
    await model.sumBill(groupId).then( result => {
        sum = Number(result[0]['sum(money)'])
    })

    await model.userTotal(groupId).then ( result => {
        per = Math.round(sum / result[0]['count(*)'] * 100) / 100
    })


    await ctx.render('main', {
        title: '总览',
        user: ctx.session.user,
        billList :  billList,
        sum: sum,
        per: per
    })
})

router.get('/addBill', async (ctx, next) => {
    await checkLogin(ctx)
    await ctx.render('addBill', {
        title: '添加',
        user: ctx.session.user,
        options: options
    })
})

router.get('/addBillAjax', async (ctx, next) => {
    let query = {};
    if (ctx.query.time && ctx.query.type && ctx.query.money) {
        query.time = ctx.query.time
        query.type = ctx.query.type
        query.money = ctx.query.money
        query.userid = ctx.session.id
        query.username = ctx.session.user
        query.desc = ctx.query.desc ? ctx.query.desc : ''
        query.group_id = ctx.session.groupId
    }

    await model.insertBill(query).then(result => {
        ctx.body = response.success('添加成功')
    }).catch(err => {
        ctx.body = response.error(response.code.addBillFail, '添加失败')
        console.log(err)
    })

})

router.get('/per', async (ctx, next) => {
    await checkLogin(ctx);

    let sum = '', per = '',users = [], bills = [], perList = [], groupId = ctx.session.groupId;

    await model.sumBill(groupId).then( result => {
        sum = Number(result[0]['sum(money)'])
    })

    await model.userTotal(groupId).then ( result => {
        per = Math.round(sum / result[0]['count(*)'] * 100) / 100
    })

    await model.findAllUser(groupId).then ( result => {
        users = result
    })

    await model.sumBillGroupByUser(groupId).then ( result => {
        bills = result
    })

    for (let i = 0; i < users.length; i ++) {
        let perItem = {
            username: users[i].username,
            per : per,
            perpay: 0
        }

        for (let j = 0; j < bills.length; j ++) {
            if(users[i].id === bills[j].userid) {
                perItem.perpay = bills[j].perpay
            }
        }

        perList.push(perItem)
    }

    await ctx.render('per', {
        title: '个人明细',
        user: ctx.session.user,
        perList: perList
    })
})

router.get('/updateBillStatus', async (ctx, next) => {
    let power = 0, groupId = ctx.session.groupId;
    await model.findUserDataById(ctx.session.id)
        .then(result => {
            console.log(result);
            if(result[0].admin.toString() === '1') {
                power = 1;
            } else {
                ctx.body = response.error(response.code.powerFail, '权限不足');
            }

        }).catch(err => {
            console.log(err)
        })

    if (!power) return;

    await model.updateBillStatus(groupId).then( result => {
        ctx.body = response.success('结算成功')
    }).catch(err => {
        ctx.body = response.error(response.code.updateBillFail, '结算失败')
        console.log(err)
    })
})

router.get('/face', async (ctx, next) => {

    await ctx.render('faceDemo', {
        title: 'test'
    })
})

module.exports = router
