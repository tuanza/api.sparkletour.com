const Router = require('koa-router')
const router = new Router({
    prefix: '/flights'
});
const ResultInfo = require('../common/ResultInfo')
const dao = {
    mssql: require('../daos/mssql/flightDAO'),
    mongodb: require('../daos/mongodb/flightDAO')
}
router.get('/', async function (ctx, next) {
    let ri = new ResultInfo()
    let query = {}
    let flight_no = ctx.query.flight_no || ''
    if (flight_no != '') {
        query['flight_no'] = {'$regex':flight_no,'$options':'i'}
    }
    let pageNo = parseInt(ctx.query.pageNo) || 1
    let pageSize = parseInt(ctx.query.pageSize) || 20
    try {
        let rs = await dao.mongodb.search(query, pageNo, pageSize)
        ri.succ(rs)
    } catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri
})
router.post('/async', async function (ctx, next) {
    let ri = new ResultInfo()
    try {
        let pageNo = parseInt(ctx.query.pageNo) || 1
        let pageSize = parseInt(ctx.query.pageSize) || 100
        let rs = await dao.mssql.get(pageNo, pageSize)
        let total = rs.total
        if (total > 0) {
            let list = rs.list
            let rs2 = await dao.mongodb.addMany(list)
            if (rs2.result.ok == 1) {
                ri.succ({ curPage: pageNo, total: total })
            }
            else {
                ri.error('同步失败')
            }
        }
        else {
            ri.error('没有数据')
        }
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})



module.exports = router