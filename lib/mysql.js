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

// 增加账单记录
let insertBill = (value) => {
    let _sql = "insert into bill_log set ?"
    return query(_sql, value)
}

// 查询所有账单
let findAllBill = (valule) => {
    let _sql = "select * from bill_log where status = '0'"
    return query(_sql)
}

let sumBill = () => {
    let _sql = "select sum(money) from bill_log where status = '0'"
    return query(_sql)
}

let userTotal = () => {
    let _sql = "select count(*) from users"
    return query(_sql)
}

let findAllUser = () => {
    let _sql = "select * from users"
    return query(_sql)
}

let sumBillGroupByUser = () => {
    let _sql = "select userid, sum(money) as perpay from bill_log where status = '0' group by userid"
    return query(_sql)
}

module.exports = {
    query,
    findUserData,
    insertBill,
    findAllBill,
    sumBill,
    userTotal,
    findAllUser,
    sumBillGroupByUser
}