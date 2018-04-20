/**
 * Created by acc on 2018/3/28.
 */

/**
 * 基础操作类
 */
class Base {
    /**
     * 绑定layer
     */
    constructor() {
        layui.use('layer', function() {
            window.layer = layui.layer;
        });
    }

    /**
     * 获取urlseach参数
     * @return {Object}
     */
    getRequest() {
        let url = location.search;
        let theRequest = {};
        if (url.indexOf("?") !== -1) {
            let str = url.substr(1);
            let strs = str.split("&");
            for (let i = 0; i < strs.length; i++) {
                let value = unescape(strs[i].split("=")[1]);
                theRequest[strs[i].split("=")[0]] = value;
            }
        }
        return theRequest;
    }
}

/**
 * 操作dom的主要方法类
 */
class Main extends Base {
    /**
     * 构造函数
     */
    constructor() {
        super();

        let $ = window.$;
        let dels = $('.del');

        dels.on('click', function() {
            let id = $(this).data().billid;

            layer.open({
                type: 1,
                title: false,
                closeBtn: false,
                area: '300px;',
                shade: 0.8,
                id: 'LAY_layuipro',
                btn: ['确定', '取消'],
                btnAlign: 'c',
                moveType: 1,
                content: '<div style="padding: 50px; line-height: 22px; background-color: #393D49; color: #fff; font-weight: 300;">确定删除此条记录？</div>',
                yes: function () {
                    $.get('/delBillLog', {id: id}, function (res) {
                        if (res.code === '0000') {
                            setTimeout(function () {
                                window.location.reload()
                            }, 1000)
                        }

                        layer.closeAll();
                        layer.msg(res.msg);
                    })
                }
            });
        })
    }
}

class Index extends Base {
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

class AddBill extends Base {
    constructor() {
        super()

        const billId = this.getRequest().id;
        const _this = this;
        if (billId) {
            $.get('/getBillLogInfo', {id: billId}, function (res) {
                if (res.code === '0000') {
                    let data = res.msg;
                    _this.setTime(data.time);
                    _this.setFormDefault(data)
                }
            })
        } else {
            this.setTime()
        }

        layui.use('form', function () {
            let form = layui.form;

            //监听提交
            form.on('submit(formDemo)', function (data) {
                console.log(data.field)

                let params = {
                    id: billId,
                    money : data.field.money,
                    time : data.field.time,
                    type : data.field.type,
                    descr : data.field.descr,
                }
                if(billId) {
                    $.get('/updateBillLogInfo', params, function (res) {
                        if (res.code === '0000') {
                            layer.msg(res.msg);
                            setTimeout(function () {
                                location.href = '/main'
                            }, 1000)
                        } else {
                            layer.msg(res.msg);
                        }
                    })
                } else {
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
                }

                return false;
            });
        });


    }

    setTime (time) {
        layui.use('laydate', function () {
            const date = time ? new Date(time) : new Date();
            const defaultTime = date.getFullYear() + '-' + ((date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' + (date.getDate() > 9 ? date.getDate() : '0' + date.getDate())
            let laydate = layui.laydate;
            laydate.render({
                elem: '#time',
                value: defaultTime
            });
        })
    }

    setFormDefault (data) {
        const time = $('input[name="time"]');
        const money = $('input[name="money"]');
        const descr = $('textarea[name="descr"]');
        const type = $('select[name="type"]');
        const select = $('.layui-edge').prev();

        money.val(data.money);
        type.val(Number(data.type));
        select.val(data.typeName);
        descr.val(data.descr);
    }
}

class Per extends Base {
    constructor() {
        super()

        function convert2canvas() {

            var shareContent = document.querySelector("#capture");
            var width = $(window).width();
            var height = $(window).height();
            var canvas = document.createElement("canvas");
            var scale = 2;

            canvas.width = width * scale;
            canvas.height = height * scale;
            canvas.getContext("2d").scale(scale, scale);

            var opts = {
                scale: scale,
                canvas: canvas,
                logging: true,
                width: width,
                height: height
            };
            html2canvas(shareContent, opts).then(function (canvas) {
                var context = canvas.getContext('2d');

                //var img = Canvas2Image.convertToImage(canvas, canvas.width, canvas.height);

                Canvas2Image.saveAsImage(canvas, canvas.width, canvas.height);
                /*document.body.appendChild(img);
                 $(img).css({
                 "width": canvas.width / 2 + "px",
                 "height": canvas.height / 2 + "px",
                 })*/
            });
        }

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
                        if (res.code === '0000') {
                            setTimeout(function () {
                                location.href = '/main'
                            }, 1000)

                            convert2canvas()
                        }

                        layer.closeAll();
                        layer.msg(res.msg);
                    })
                }
            });
        })
    }
}