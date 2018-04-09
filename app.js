const Koa = require('koa');

const koaBody = require('koa-body');
const Router = require('koa-router')
const port = 3010
const product = require('./routers/product')
const udesk = require('./routers/udesk')
const order = require('./routers/order')
const upload = require('./routers/upload')
const contract = require('./routers/contract')
const dict = require('./routers/dict')
const user = require('./routers/user')
const adv = require('./routers/adv')
const geo = require('./routers/geo')
const flight = require('./routers/flight')
const card = require('./routers/card')
const label = require('./routers/label')
const news = require('./routers/news')
const app = new Koa();

const log4js = require('log4js')
log4js.configure({
    appenders: {
        console: { type: 'console' },
        file: { type: 'datefile', filename: "../logs/err-log", "pattern": "-yyyy-MM-dd.log", "alwaysIncludePattern": true }
    },
    categories: {
        err_log: { appenders: ['file'], level: 'info' },
        default: { appenders: ['console'], level: 'info' }
    }
})
const logger = log4js.getLogger('err_log')
const router = new Router()
app.use(koaBody());
router.use(product.routes(), product.allowedMethods());
router.use(udesk.routes(), udesk.allowedMethods());
router.use(order.routes(), order.allowedMethods());
router.use(upload.routes(), upload.allowedMethods());
router.use(contract.routes(), contract.allowedMethods());
router.use(dict.routes(), dict.allowedMethods());
router.use(user.routes(), user.allowedMethods());
router.use(adv.routes(), adv.allowedMethods());
router.use(geo.routes(), geo.allowedMethods());
router.use(flight.routes(), flight.allowedMethods());
router.use(card.routes(), card.allowedMethods());
router.use(label.routes(), label.allowedMethods());
router.use(news.routes(), news.allowedMethods());
app.use(router.routes()).use(router.allowedMethods());
app.use(async (ctx) => {
    ctx.status = 404
    ctx.body = "404"
})
app.on('error', err => {
    logger.info(err)
});
app.listen(port);
console.log('服务器已运行，监听端口：' + port)