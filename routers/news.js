const Router = require('koa-router')
const router = new Router({
    prefix: '/news'
});
const ResultInfo = require('../common/ResultInfo')
const dao = require('../daos/mongodb/newsDAO')
const webclient = require('../common/webclient')
const common = require('../daos/mongodb/common')
const moment = require('moment')
router.post('/syncfromsql', async function (ctx, next) {
    let ri = new ResultInfo()
    try {
        let url = 'http://172.18.2.218:8002/api/news/SearchNews'
        let res = await webclient.post(url, { "Id": "", "Title": "" })
        let max_id = 0
        res = res.map(item => {
            let images = []
            item.ImgList.forEach(image => {
                images.push({ 'title': image.Title, 'url': image.ImgUrl })
            });
            let id = parseInt(item.Id)
            if (id > max_id) {
                max_id = id
            }
            return { 'id': id, 'title': item.Title, 'content': item.Content, 'images': images, 'created_at': moment(item.CreateDate).toDate(), 'updated_at': new Date(), 'sort_no': parseInt(item.SortNo), 'is_valid': item.IsValid == '1' }
        })

        let rs = await dao.addMany(res)
        common.setNextSequenceValue(common.sequenceNames.news_id, max_id + 1)
        ri.succ(rs.result)
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})

router.get('/', async function (ctx, next) {
    let ri = new ResultInfo()
    let query = { 'is_valid': true }
    let pageNo = parseInt(ctx.query.pageNo) || 1
    let pageSize = parseInt(ctx.query.pageSize) || 20
    let sortBy = { 'sort_no': 1, 'id': -1 }
    let title = ctx.query.title || ''
    let id = parseInt(ctx.query.id) || 0
    let is_simple = parseInt(ctx.query.is_simple) || 0
    let fields = {}
    try {
        if (title) {
            query['title'] = new RegExp(title)
        }
        if (id) {
            query['id'] = id
        }
        if (is_simple) {
            fields = { "id": 1, "title": 1, "images": 1 }
        }
        let list = await dao.find(query, fields, pageNo, pageSize, sortBy)
        ri.succ(list)
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})

router.post('/', async function (ctx, next) {
    let ri = new ResultInfo()
    let obj = ctx.request.body
    try {
        let id = await common.getNextSequenceValue(common.sequenceNames.news_id)
        obj.id = id
        obj.created_at = new Date()
        obj.updated_at = obj.created_at
        let rs = await dao.add(obj)
        if (rs.result.ok) {
            rs.result.new_id = id
        }
        else {
            rs.result.new_id = -1
        }
        ri.succ(rs.result)
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})

router.get('/:id', async function (ctx, next) {
    let ri = new ResultInfo()
    let id = parseInt(ctx.params.id)
    try {
        let query = { 'id': id }
        let item = await dao.get(query)
        ri.succ(item)
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})

router.post('/:id', async function (ctx, next) {
    let ri = new ResultInfo()
    let id = parseInt(ctx.params.id)
    let obj = ctx.request.body
    try {
        delete obj._id
        obj.updated_at = obj.created_at
        let rs = await dao.update({ 'id': id }, obj, false)
        ri.succ(rs.result)
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})
module.exports = router