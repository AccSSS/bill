/**
 * Created by acc on 2018/3/28.
 */
module.exports ={
    // 已经登录了
    checkNotLogin: (ctx) => {
        if (ctx.session && ctx.session.user) {
            ctx.redirect('/main');
            return false;
        }
        return true;
    },
    //没有登录
    checkLogin: (ctx) => {
        if (!ctx.session || !ctx.session.user) {
            ctx.redirect('/index');
            return false;
        }
        return true;
    }
}