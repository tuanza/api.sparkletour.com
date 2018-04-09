const Router = require('koa-router')
const router = new Router({
    prefix: '/labels'
});
const ResultInfo = require('../common/ResultInfo')
const dao = {
    mongodb: require('../daos/mongodb/labelDAO')
}



//获取特定标签
router.get('/:id', async function (ctx, next) {
    let ri = new ResultInfo()
    let id = parseInt(ctx.params.id) || 0
    if (id == 0) {
        ri.error('参数错误')
    }
    else {
        try {
            let rs = await dao.mongodb.get({ 'id': id })
            ri.succ(rs)
        } catch (err) {
            ri.error(err)
        }
    }
    ctx.response.body = ri
})

//获取当前id计数
router.post('/curindex', async function (ctx, next) {
    let ri = new ResultInfo()
    try {
        let rs = await dao.mongodb.getCurId()
        ri.succ(rs)
    } catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri
})

//修改标签
router.post('/:id', async function (ctx, next) {
    let ri = new ResultInfo()
    let id = parseInt(ctx.params.id) || 0
    let label = ctx.request.body
    if (id == 0) {
        ri.error('参数错误')
    }
    else {
        try {
            delete label._id
            let rs = await dao.mongodb.update({ 'id': id }, label, false)
            if (rs.result.ok == 1) {
                ri.succ('', '修改成功')
            }
            else {
                ri.error('操作失败')
            }

        } catch (err) {
            ri.error(JSON.stringify(err))
        }
    }

    ctx.response.body = ri
})

//获取全部标签
router.get('/', async function (ctx, next) {
    let ri = new ResultInfo()
    try {
        let rs = await dao.mongodb.get({})
        ri.succ(rs)
    } catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri
})

//新增标签
router.post('/', async function (ctx, next) {
    let ri = new ResultInfo()
    let label = ctx.request.body
    try {
        let rs = await dao.mongodb.add(label)
        if (rs.result.ok == 1) {
            ri.succ(label.id)
        }
        else {
            ri.error('操作失败')
        }

    } catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})



module.exports = router