/**
 * Created by acc on 2018/3/28.
 */
var mysql = require('mysql');
var config = require('./config');

var pool = mysql.createPool({
    host: config.database.HOST,
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE,
    port: config.database.PORT
});

let query = (sql, values) => {

    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err)
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })

}

// 查找用户
let findUserData = (name) => {
    let _sql = `select * from users where username="${name}";`
    return query(_sql)
}

let findUserDataById = (id) => {
    let _sql = `select * from users where id="${id}";`
    return query(_sql)
}

// 增加账单记录
let insertBill = (value) => {
    let _sql = "insert into bill_log set ?"
    return query(_sql, value)
}

// 查询所有账单
let findAllBill = (groupId) => {
    let _sql = `select * from bill_log where group_id="${groupId}" and status = '0' ORDER BY time ASC;`
    return query(_sql)
}

let sumBill = (groupId) => {
    let _sql = `select sum(money) from bill_log where group_id="${groupId}" and status = '0';`
    return query(_sql)
}

let userTotal = (groupId) => {
    let _sql = `select count(*) from users where group_id="${groupId}";`
    return query(_sql)
}

let findAllUser = (groupId) => {
    let _sql = `select * from users where group_id="${groupId}";`
    return query(_sql)
}

let sumBillGroupByUser = (groupId) => {
    let _sql = `select userid, sum(money) as perpay from bill_log where status = '0' and group_id="${groupId}" group by userid;`
    return query(_sql)
}

let updateBillStatus = (groupId) => {
    let _sql = `update bill_log set status = '1' where status = '0' and group_id="${groupId}";`
    return query(_sql)
}

module.exports = {
    query,
    findUserData,
    findUserDataById,
    insertBill,
    findAllBill,
    sumBill,
    userTotal,
    findAllUser,
    sumBillGroupByUser,
    updateBillStatus
}