const Router = require('koa-router')
const router = new Router({
    prefix: '/geo'
});
const ResultInfo = require('../common/ResultInfo')
const geoDAO = {
    mssql: require('../daos/mssql/geoDAO'),
    mongodb: require('../daos/mongodb/geoDAO')
}
router.get('/cities', async function (ctx, next) {
    let ri = new ResultInfo()
    let query = {}
    let cityName = ctx.query.cityname || ''
    if (cityName != '') {
        cityName = cityName.toLocaleLowerCase()
        let hp = cityName.toLocaleUpperCase()
        query['$or'] = [{ 'CityName': new RegExp(cityName) }, { 'CityNameEng': new RegExp(cityName) }, { 'HelpCode': new RegExp(cityName) }]
    }
    let pageNo = parseInt(ctx.query.pageNo) || 1
    let pageSize = parseInt(ctx.query.pageSize) || 20
    try {
        let rs = await geoDAO.mongodb.cityDAO.search(query, pageNo, pageSize)
        ri.succ(rs)
    } catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri
})
router.post('/cities/async', async function (ctx, next) {
    let ri = new ResultInfo()
    try {
        let ds = await geoDAO.mssql.cityDAO.getAllCities()
        if (ds && ds.length > 0) {
            let dt = ds[0]
            let count = 0
            ri.succ("", "正在更新")
            ctx.response.body = ri
            for (let i = 0, len = dt.length; i < len; i++) {
                let city = dt[i]
                let rs = await geoDAO.mongodb.cityDAO.update({ 'CityID': city.CityID }, city, true)
                count += rs.result.ok
            }
            console.log(`更新完成，共：${count}条数据`)
        }
        else {
            ri.error('获取城市失败')
        }
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})



module.exports = router