/**
 * Created by acc on 2018/3/28.
 */
const config = {
    // 启动端口
    port: 3000,
    // 数据库配置
    database: {
        DATABASE: 'bill',
        USERNAME: 'root',
        PASSWORD: 'ycj123456',
        PORT: '3306',
        HOST: '111.231.89.14'
            // DATABASE: 'Bill',
            // USERNAME: 'root',
            // PASSWORD: 'root',
            // PORT: '3306',
            // HOST: 'localhost',
    }
}

console.log(process.env.NODE_ENV)

module.exports = config