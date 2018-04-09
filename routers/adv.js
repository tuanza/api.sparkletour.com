const Router = require('koa-router')
const router = new Router({
    prefix: '/advs'
});
const ResultInfo = require('../common/ResultInfo')
const advDAO = {
    mongodb: require('../daos/mongodb/advDAO'),
    mssql: require('../daos/mssql/advDAO')
}
router.post('/syncfromsql', async function (ctx, next) {
    let ri = new ResultInfo()
    try {
        let ds = await advDAO.mssql.getAll()
        let areas = ds[0]
        let advs = ds[1]
        areas.forEach(area => {
            let area_id = area.area_id
            area.advs = []
            advs.forEach(adv => {
                if (adv.area_id == area_id) {
                    delete adv.area_id
                    let images = JSON.parse(adv.images)
                    let contents = JSON.parse(adv.contents)
                    adv.images = []
                    adv.contents = []
                    images.forEach(image => {
                        adv.images.push({ "title": image.Title, "url": image.ImgUrl })
                    })
                    contents.forEach(content => {
                        adv.contents.push({ "title": content.Title, "content": content.Content })
                    })
                    adv.created_at = new Date()
                    adv.updated_at = adv.created_at
                    area.advs.push(adv)
                }
            })
        })
        areas.sort(function (a, b) {
            if (a.channel_id == b.channel_id) {
                return a.area_id - b.area_id
            }
            else {
                return a.channel_id - b.channel_id
            }
        })
        let rs = await advDAO.mongodb.addMany(areas)
        ri.succ(rs.result)
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})


router.post('/areas', async function (ctx, next) {
    let ri = new ResultInfo()
    let obj = ctx.request.body
    try {
        var rs = await advDAO.mongodb.add(obj)
        ri.succ(rs)
    }
    catch (e) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})

router.get('/areas', async function (ctx, next) {
    let ri = new ResultInfo()
    let query = {}
    let areaIds = ctx.query.aids || ''
    let channel_id = parseInt(ctx.query.cid) || 0
    if (areaIds != '') {
        areaIds = areaIds.split(',')
        areaIds = areaIds.map(areaId => {
            return parseInt(areaId)
        })
    }
    if (areaIds) {
        query['area_id'] = { $in: areaIds }
    }
    if (channel_id) {
        query['channel_id'] = channel_id
    }
    try {
        var rs = await advDAO.mongodb.find(query)
        ri.succ(rs)
    }
    catch (e) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})

router.post('/areas/:id', async function (ctx, next) {
    let ri = new ResultInfo()
    let area_id = parseInt(ctx.params.id)
    let obj = ctx.request.body
    try {
        delete obj._id
        obj.updated_at = new Date()
        var rs = await advDAO.mongodb.update({ 'area_id': area_id }, obj)
        ri.succ(rs.result)
    }
    catch (err) {
        ri.error(JSON.stringify(err.message))
    }
    ctx.response.body = ri
})

router.post('/areas/:id/advs', async function (ctx, next) {
    let ri = new ResultInfo()
    let area_id = parseInt(ctx.params.id) || 0
    if (area_id == 0) {
        ri.error('缺少参数:id')
    }
    else {
        let obj = ctx.request.body
        try {
            obj.created_at = new Date()
            obj.updated_at = obj.created_at
            var rs = await advDAO.mongodb.update({ 'area_id': area_id }, { $push: { 'advs': obj } }, false)
            ri.succ(rs)
        }
        catch (e) {
            ri.error(JSON.stringify(err))
        }
    }

    ctx.response.body = ri
})

router.post('/areas/:id/advs/:index', async function (ctx, next) {
    let ri = new ResultInfo()
    let area_id = parseInt(ctx.params.id)
    let index = parseInt(ctx.params.index)
    if (area_id == 0) {
        ri.error('缺少参数:id')
    }
    else {
        let adv = ctx.request.body
        let update_obj = {}
        update_obj['advs.' + index] = adv
        try {
            update_obj.updated_at = new Date()
            var rs = await advDAO.mongodb.update({ 'area_id': area_id }, update_obj, false)
            ri.succ(rs)
        }
        catch (e) {
            ri.error(JSON.stringify(err))
        }
    }

    ctx.response.body = ri
})

module.exports = router
