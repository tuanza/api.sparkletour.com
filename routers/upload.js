const Router = require('koa-router')
const router = new Router({
    prefix: '/upload'
});
const ResultInfo = require('../common/ResultInfo')
const uploadDAO = {
    mongodb: require('../daos/mongodb/uploadDAO')
}
var mime = require('mime-types')

router.post('/img', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var typeId = ctx.request.body.typeId
        var content = ctx.request.body.content
        var res = await uploadDAO.mongodb.upload(typeId, content)
        if (res.result.ok == 1) {
            ri.succ(res.insertedIds[0])
        }
        else {
            ri.error(result)
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var res = await upload(ctx)
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.get('/:id/:filename', async function (ctx, next) {
    var ri = new ResultInfo()
    var id = ctx.params.id
    var fileName = ctx.params.filename
    try {
        var res = await uploadDAO.mongodb.download(id)
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.status = 200;
    ctx.response.type = mime.lookup(fileName)
    ctx.response.length = Buffer.byteLength(res);
    ctx.response.body = res;
})


async function upload(ctx) {
    var fileName = ctx.query.fileName
    var chunks = [];
    var size = 0;
    ctx.req.on('data', function (chunk) {
        chunks.push(chunk);
        size += chunk.length;
    });
    return new Promise(function (resolve, reject) {
        ctx.req.on("end", async function () {
            try {
                var buffer = Buffer.concat(chunks, size);
                var res = await uploadDAO.mongodb.upload(buffer, fileName)
                resolve(res)
            }
            catch (err) {
                reject(err)
            }
        })
    })
}

module.exports = router