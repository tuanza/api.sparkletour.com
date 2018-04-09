const Router = require('koa-router')
const router = new Router({
    prefix: '/cards'
});
const ResultInfo = require('../common/ResultInfo')
const dao = require('../daos/mongodb/cardDAO')

router.get('/initpass', async function (ctx, next) {
    let ri = new ResultInfo()
    var arr = []
    for (var i = 1; i <= 100; i++) {
        let no = PrefixInteger(i, 6)
        let pass = Math.random().toString().substr(2, 6)
        let item = { "card_no": no, "password": pass.toString() }
        arr.push(item)
    }
    arr.sort(function (a, b) {
        return parseInt(a) - parseInt(b)
    })
    try {
        let rs = await dao.addMany(arr)
        if (rs.result.ok == 1) {
            ri.succ(rs.result.n)
        }
        else {
            ri.error('新增失败')
        }
    } catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})

router.get('/pass', async function (ctx, next) {

    try {
        let rs = await dao.find({})
        rs.sort(function (a, b) {
            return parseInt(a.card_no) - parseInt(b.card_no)
        })
        var arr = ['<table style="border=1">']
        rs.forEach(element => {
            arr.push(`<tr><td>${element.card_no}</td><td>${element.password}</td></tr>`)
        })
        arr.push('</table>')
        ctx.response.body = arr.join('')

    } catch (err) {
        ctx.response.body = JSON.stringify(err)
    }
})

router.get('/byuserphone', async function (ctx, next) {
    let ri = new ResultInfo()
    try {
        let user_phone = ctx.query.phone || ''
        if (user_phone == '') {
            ri.error('缺少参数phone')
        }
        else {
            let rs = await dao.find({ 'user_phone': user_phone })
            ri.succ(rs)
        }
    } catch (err) {
        ctx.response.body = JSON.stringify(err)
    }
    ctx.response.body = ri
})

router.get('/:cn', async function (ctx, next) {
    let ri = new ResultInfo()
    let card_no = ctx.params.cn || ''
    if (card_no == '') {
        ri.error('参数错误:cn')
    }
    else {
        try {
            let item = await dao.get({ 'card_no': card_no })
            if (item) {
                ri.succ(item)
            }
            else {
                ri.error('没有数据')
            }
        } catch (err) {
            ri.error(JSON.stringify(err))
        }
    }
    ctx.response.body = ri
})

router.post('/:cn', async function (ctx, next) {
    let ri = new ResultInfo()
    let card_no = ctx.params.cn || ''
    if (card_no == '') {
        ri.error('参数错误:cn')
    }
    else {
        try {
            let obj = ctx.request.body
            delete obj._id
            let rs = await dao.update({ 'card_no': card_no }, obj, false)
            if (rs.result.ok) {
                ri.succ('', '修改成功')
            }
            else {
                ri.error('修改失败')
            }
        } catch (err) {
            ri.error(JSON.stringify(err))
        }
    }
    ctx.response.body = ri
})

router.post('/:cn/records', async function (ctx, next) {
    let ri = new ResultInfo()
    let card_no = ctx.params.cn || ''
    if (card_no == '') {
        ri.error('参数错误:cn')
    }
    else {
        try {
            let obj = ctx.request.body
            let rs = await dao.update({ 'card_no': card_no }, { $push: { "records": obj } }, false)
            if (rs.result.ok) {
                ri.succ('', '修改成功')
            }
            else {
                ri.error('修改失败')
            }
        } catch (err) {
            ri.error(JSON.stringify(err))
        }
    }
    ctx.response.body = ri
})

router.post('/:cn/bindphone', async function (ctx, next) {
    let ri = new ResultInfo()
    let card_no = ctx.params.cn || ''
    let password = ctx.query.pass || ''
    let phone = ctx.request.body.phone
    if (card_no == '') {
        ri.error('参数错误:cn')
    }
    else if (password == '') {
        ri.error('参数错误pass')
    }
    else {
        try {
            let obj = ctx.request.body
            let rs = await dao.update({ 'card_no': card_no, 'password': password }, { 'user_phone': phone }, false)
            if (rs.result.ok) {
                ri.succ('', '绑定成功')
            }
            else {
                ri.error('绑定失败')
            }
        } catch (err) {
            ri.error(JSON.stringify(err))
        }
    }
    ctx.response.body = ri
})
router.get('/', async function (ctx, next) {
    let ri = new ResultInfo()
    let card_no = ctx.query.cno || ''
    let customer_phone = ctx.query.cp || ''
    let customer_name = ctx.query.cn || ''
    let page_no = parseInt(ctx.query.pn) || 1
    let page_size = parseInt(ctx.query.ps) || 20
    let query = {}
    if (card_no != '') {
        query['card_no'] = card_no
    }
    if (customer_phone != '') {
        query['customer_phone'] = customer_phone
    }
    if (customer_name != '') {
        query['customer_name'] = new RegExp(customer_name)
    }
    try {
        let list = await dao.find(query, page_no, page_size)
        ri.succ(list)
    } catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})
function PrefixInteger(num, length) {
    return (Array(length).join('0') + num).slice(-length);
}
module.exports = router