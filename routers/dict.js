const Router = require('koa-router')
const router = new Router({
    prefix: '/dicts'
});
const ResultInfo = require('../common/ResultInfo')
const dicts = require('../common/dists')

router.get('/', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var ids = ctx.query.ids || ''
        if (ids) {
            ids = ids.split(',')
            var tars = dicts.getDictsByIds(ids)
            ri.succ(tars)
        }
        else {
            ri.succ(dicts.getAll())
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})
module.exports = router