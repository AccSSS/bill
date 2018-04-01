/**
 * Created by acc on 2018/3/28.
 */


class Main {
    constructor() {
        layui.use('layer', function () {
            window.layer = layui.layer;
        })
    }
}

class Index extends Main {
    constructor() {
        super();

        let userNameInput = $('#username'),
            psInput = $('#password');

        $('.login-btn').on('click', function () {
            let username = userNameInput.val(),
                password = psInput.val();

            if (username && password) {
                console.log(userNameInput.val(), psInput.val());
                $.get('./login', {username: username, password: password}, function (res) {
                    if (res.code === '0000') {
                        location.href = '/main';
                    } else {
                        layer.msg(res.msg);
                    }
                })
            } else {
                layer.msg('用户名或密码错误');
            }
        })
    }
}

class AddBill extends Main {
    constructor() {
        super()
        layui.use('laydate', function () {
            const date = new Date();
            const defaultTime = date.getFullYear() + '-' + ((date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate())
            let laydate = layui.laydate;
            laydate.render({
                elem: '#time',
                value: defaultTime
            });
        })

        layui.use('form', function () {
            let form = layui.form;

            //监听提交
            form.on('submit(formDemo)', function (data) {
                $.get('/addBillAjax', data.field, function (res) {
                    if (res.code === '0000') {
                        layer.msg(res.msg);
                        setTimeout(function () {
                            location.href = '/main'
                        }, 1000)
                    } else {
                        layer.msg(res.msg);
                    }
                })

                return false;
            });
        });

    }
}

class Per extends Main {
    constructor() {
        super()

        $('.open-next').bind('click', function () {
            layer.open({
                type: 1,
                title: false,
                closeBtn: false,
                area: '300px;',
                shade: 0.8,
                id: 'LAY_layuipro',
                btn: ['确定', '再等等'],
                btnAlign: 'c',
                moveType: 1,
                content: '<div style="padding: 50px; line-height: 22px; background-color: #393D49; color: #fff; font-weight: 300;">确定开启下个月的记录？</div>',
                yes: function () {
                    $.get('/updateBillStatus', {}, function (res) {
                        if(res.code === '0000') {
                            setTimeout(function () {
                                location.href = '/main'
                            }, 1000)
                        }
                        layer.msg(res.msg);
                    })
                }
            });
        })
    }
}