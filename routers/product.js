const Router = require('koa-router')
const router = new Router({
    prefix: '/products'
});
const dao = {
    mssql: require('../daos/mssql/productDAO'),
    mongodb: require('../daos/mongodb/productDAO')
}
const lushDAO = {
    webapi: require('../daos/webapi/lushDAO')
}
const ResultInfo = require('../common/ResultInfo')
router.post('/', async function (ctx, next) {
    let ri = new ResultInfo()
    let obj = ctx.request.body
    try {
        let id = await dao.mongodb.add(obj)
        if (id > 0) {
            ri.succ(id)
        }
        else {
            ri.error('操作失败')
        }
    } catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri
})
router.get('/', async function (ctx, next) {
    let ri = new ResultInfo()
    let query = {}
    let id = parseInt(ctx.query.id) || 0
    let labels = ctx.query.lbls || ''
    if (id > 0) {
        query['id'] = id
    }
    if (labels != '') {
        labels = labels.split(',')
        let tmp = []
        labels.forEach(label => {
            tmp.push({ "$elemMatch": { "id": parseInt(label) } })
        })
        query["labels"] = { "$all": tmp }
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

router.get('/:id', async function (ctx, next) {
    let ri = new ResultInfo()
    let id = parseInt(ctx.params.id) || 0
    if (id == 0) {
        ri.error("缺少参数id")
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

router.post('/:id', async function (ctx, next) {
    let ri = new ResultInfo()
    let id = parseInt(ctx.params.id) || 0
    let obj = ctx.request.body
    delete obj._id
    if (id == 0) {
        ri.error("缺少参数id")
    }
    else {
        try {
            let rs = await dao.mongodb.update({ 'id': id }, obj, false)
            ri.succ(rs)
        } catch (err) {
            ri.error(err)
        }
    }
    ctx.response.body = ri
})

router.get('/lushu/trips', async function (ctx, next) {
    let ri = new ResultInfo()
    let q = ctx.query.q || ''
    if (q == '') {
        ri.error("缺少参数q")
    }
    else {
        try {
            let rs = await lushDAO.webapi.findTrip(q)
            ri.succ(rs)
        } catch (err) {
            ri.error(err)
        }
    }
    ctx.response.body = ri
})

router.get('/lushu/trips/:id', async function (ctx, next) {
    let ri = new ResultInfo()
    let id = ctx.params.id || ''
    try {
        let rs = await lushDAO.webapi.getTrip(id)
        if (rs.success) {
            let trip = rs.result.trip
            let days = []
            let tripAccomadations = []
            trip.schedule.forEach(day => {
                days.push(day.id)

            })
            trip.accomadations.forEach(accomadation => {
                tripAccomadations.push(accomadation.id)
            })
            rs = await lushDAO.webapi.getTripDays(id, { "days": days })
            if (rs.success) {
                let tripDays = rs.result.tripDays
                let long_transits = []
                let transits = []
                let activities = []
                tripDays.forEach(tripDay => {
                    tripDay.agenda.forEach(agenda => {
                        if (agenda.longTransit) {
                            long_transits.push(agenda.longTransit.id)
                        }
                        if (agenda.activity) {
                            activities.push(agenda.activity.id)
                        }
                    })
                })
                let tripLongTransits = []
                let tripActivities = []
                rs = await lushDAO.webapi.getTripLongTransit(id, long_transits)
                if (rs.success) {
                    tripLongTransits = rs.result.tripLongTransits
                }
                rs = await lushDAO.webapi.getTripActivity(id, activities)
                if (rs.success) {
                    tripActivities = rs.result.tripActivities
                }

                let longTransitIndex = 0
                tripDays.forEach(tripDay => {
                    tripDay.agenda.forEach(agenda => {
                        if (agenda.longTransit) {
                            agenda.longTransit = tripLongTransits[longTransitIndex]
                            longTransitIndex++
                        }
                        if (agenda.activity) {
                            let tars = tripActivities.filter(activity => {
                                return activity.id == agenda.activity.id
                            })
                            if (tars.length > 0) {
                                agenda.activity = tars[0]
                            }
                        }
                    })
                })
                trip.schedule.forEach((day, index) => {
                    trip.schedule[index] = tripDays[index]
                })
            }
            rs = await lushDAO.webapi.getTripAccomadation(id, tripAccomadations)
            if (rs.success) {
                let tripAccomadations = rs.result.tripAccomadations
                for (let i = 0, len = trip.accomadations.length; i < len; i++) {
                    trip.accomadations[i] = tripAccomadations[i]
                }
            }
            ri.succ(trip)
        }
        else {
            ri.error('没有数据')
        }
    } catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})

router.post('/lushu/trips/:id/days', async function (ctx, next) {
    let ri = new ResultInfo()
    let id = ctx.params.id || ''
    let days = ctx.request.body || ''
    if (days == '') {
        ri.error('缺少参数days')
    }
    else {
        try {
            let rs = await lushDAO.webapi.getTripDays(id, days)

            ri.succ(rs)
        } catch (err) {
            ri.error(JSON.stringify(err))
        }
    }
    ctx.response.body = ri
})
// router.get('/', async function (ctx, next) {

//     let labelIds = ctx.query.labelIds || ''
//     let pageNo = ctx.query.pageNo ? parseInt(ctx.query.pageNo) : 1
//     let pageSize = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : 20
//     //let lblId = parseInt(ctx.params.labelid) == NaN ? 0 : parseInt(ctx.params.labelid);
//     var ri = new ResultInfo()
//     try {

//         var query = {}
//         if (labelIds != '') {
//             if (labelIds.indexOf(',') > -1) {
//                 labelIds = labelIds.split(',')
//                 for (var i = 0, len = labelIds.length; i < len; i++) {
//                     labelIds[i] = { "$elemMatch": { "LabelID": parseInt(labelIds[i]) } }
//                 }
//                 query["Labels"] = { "$all": labelIds }
//             }
//             else {
//                 query["Labels"] = { "$elemMatch": { "LabelID": parseInt(labelIds) } }
//             }
//         }
//         var products = await dao.mongodb.search(query, pageNo, pageSize)
//         ri.succ({ total: products.length, list: products })
//     }
//     catch (err) {
//         ri.error(err)
//     }

//     ctx.response.body = ri;
// });

// router.post('/save', async function (ctx, next) {
//     var ri = new ResultInfo()
//     try {
//         var products = await dao.mssql.all()
//         var rs = await dao.mongodb.insertList(products)
//         ri.succ(rs.result)
//     }
//     catch (err) {
//         ri.error(err)
//     }
//     ctx.response.body = ri;
// })

// router.get('/search/:labelids', async function (ctx, next) {

//     let labelids = ctx.params.labelids
//     //let lblId = parseInt(ctx.params.labelid) == NaN ? 0 : parseInt(ctx.params.labelid);
//     var ri = new ResultInfo()
//     try {

//         var query = {}
//         if (labelids.indexOf(',') > -1) {
//             labelids = labelids.split(',')
//             for (var i = 0, len = labelids.length; i < len; i++) {
//                 labelids[i] = { "$elemMatch": { "LabelID": parseInt(labelids[i]) } }
//             }
//             query = { "Labels": { "$all": labelids } }
//         }
//         else {
//             query = { "Labels": { "$elemMatch": { "LabelID": parseInt(labelids) } } }
//         }
//         var products = await dao.mongodb.search(query)

//         ri.succ({ total: products.length, list: products })
//     }
//     catch (err) {
//         ri.error(err)
//     }

//     ctx.response.body = ri;
// });

// router.get('/import', async function (ctx, next) {
//     var ri = new ResultInfo()
//     try {
//         var products = await dao.mssql.all()
//         var rs = await dao.mongodb.insertList(products)
//         ri.succ(rs)
//     }
//     catch (err) {
//         ri.error(err)
//     }
//     ctx.response.body = ri;
// })
module.exports = router