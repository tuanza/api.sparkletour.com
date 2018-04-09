const Router = require('koa-router')
const moment = require('moment');
const router = new Router({
    prefix: '/orders'
});
const dao = {
    mssql: require('../daos/mssql/orderDAO')
}
const ResultInfo = require('../common/ResultInfo')


router.get('/daysago', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var dateNow = moment()
        var days = parseInt(ctx.query.days)
        var dateAfter = dateNow.add(-days, 'days').toDate()
        var rs = await dao.mssql.getOrdersAfterDate(moment(dateAfter).format('YYYY-MM-DD'))
        if (rs && rs.length > 0) {
            var result = []
            for (var i = 0; i < days; i++) {
                var date = moment(dateAfter)
                date.add(i, 'days')
                date = date.format('YYYY-MM-DD')
                var arr = rs.filter(function (ele) {
                    var inputDate = moment(ele.date).format('YYYY-MM-DD')
                    return date == inputDate
                })
                result.push({ 'date': date, 'count': arr.length > 0 ? arr[0].count : 0 })
            }
            ri.succ(result)
        }
        else {
            ri.error('没有数据')
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
});

router.get('/:orderNo', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var orderNo = ctx.params.orderNo
        var rs = await dao.mssql.getDetailByOrderNo(orderNo)
        ri.succ(rs)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
});

router.get('/:year/year', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var year = parseInt(ctx.params.year)
        var yearLast = year - 1
        var rs = await dao.mssql.getOrdersByYear(year)
        var rsLast = await dao.mssql.getOrdersByYear(yearLast)
        var group = await dao.mssql.getGroupMoneyByYear(year)
        var groupLast = await dao.mssql.getGroupMoneyByYear(yearLast)
        var dataSet = []
        //全年预算
        var generals = []
        var general = []
        var generalLast = []
        var generalPre = [2780000, 9950000, 2410000, 4610000, 4900000, 4450000, 9850000, 10950000, 5250000, 8850000, 3500000, 4500000]
        var generalRate = []
        var generalRateLast = []
        for (var i = 1; i <= 12; i++) {
            var month = year.toString() + (i < 10 ? "0" : "") + i
            var monthLast = yearLast.toString() + (i < 10 ? "0" : "") + i
            var tars = group.filter(function (ele) {
                return ele["团号月"] == month
            })
            var subTotal = 0
            tars.forEach(function (ele) {
                subTotal += ele["实际收入"]
            })
            generalRate.push(((subTotal * 1.0 / generalPre[i - 1]) * 100).toFixed(2) + "%")
            general.push(Math.round(subTotal))

            var tarsLast = groupLast.filter(function (ele) {
                return ele["团号月"] == monthLast
            })

            var subTotalLast = 0
            tarsLast.forEach(function (ele) {
                subTotalLast += ele["实际收入"]
            })
            generalLast.push(Math.round(subTotalLast))
            generalRateLast.push(((subTotal * 1.0 / subTotalLast) * 100).toFixed(2) + "%")
        }
        generals.push(general)
        generals.push(generalPre)
        generals.push(generalRate)
        generals.push(generalLast)
        generals.push(generalRateLast)
        dataSet.push(generals)


        //销售预算
        var sellers = []
        var sellersPre = [{ name: '张慧珺', total: 6000000 }, { name: '夏梦婷（耀悦）', total: 10000000 }, { name: '闫明-耀悦', total: 8500000 }, { name: '王昊-耀悦', total: 9500000 }, { name: '陈建帅-耀悦', total: 5000000 }, { name: '王仲石-耀悦', total: 0 }, { name: '马令玲(高端销售)', total: 4000000 }, { name: '李婷婷(高端销售)', total: 6000000 }, { name: '郭子祺-耀悦', total: 0 }, { name: '许博洋-耀悦', total: 4000000 }, { name: '朱青青(高端销售)', total: 5000000 }]
        rs.forEach(function (ele) {
            var name = ele['制单人']
            var month = ele['团号月']
            var money = ele['订单实收']
            var tars = sellers.filter(function (item) {
                return item.name == name
            })
            if (tars.length == 0) {
                var seller = { name: name, total: money, list: [{ month: month, money: money }] }
                sellers.push(seller)
            }
            else {
                tars[0].total += money
                tars[0].list.push({ month: month, money: money })
            }
        })
        sellers.forEach(function (seller) {
            //seller.months = []
            for (var i = 1; i <= 12; i++) {
                var subTotal = 0
                var month = year.toString() + (i < 10 ? '0' + i : i)
                seller.list.forEach(function (item) {
                    if (item.month == month) {
                        subTotal += item.money
                    }
                })
                //seller.months.push({ month: month, subTotal: subTotal })
                seller[month] = subTotal
            }
            var tars = sellersPre.filter(function (item) {
                return item.name == seller.name
            })
            seller.totalPre = 0
            if (tars.length > 0) {
                seller.totalPre = tars[0].total
            }
            delete seller.list
        })
        dataSet.push(sellers)

        //渠道预算
        var channels = []
        var channelsPre = [{ name: '耀悦电话', total: 9000000 }, { name: '耀悦渠道', total: 14500000 }, { name: '耀悦自销', total: 19000000 }, { name: '耀悦网单', total: 7000000 }, { name: '招商银行信用卡中心', total: 0 }]
        rs.forEach(function (ele) {
            var name = ele['订单子来源']
            var month = ele['团号月']
            var money = ele['订单实收']
            var tars = channels.filter(function (item) {
                return item.name == name
            })
            if (tars.length == 0) {
                var channel = { name: name, total: money, list: [{ month: month, money: money }] }
                channels.push(channel)
            }
            else {
                tars[0].total += money
                tars[0].list.push({ month: month, money: money })
            }
        })
        channels.forEach(function (channel) {
            //channel.months = []
            for (var i = 1; i <= 12; i++) {
                var subTotal = 0
                var month = year.toString() + (i < 10 ? '0' + i : i)
                channel.list.forEach(function (item) {
                    if (item.month == month) {
                        subTotal += item.money
                    }
                })
                //channel.months.push({ month: month, subTotal: subTotal })
                channel[month] = subTotal
            }
            var tars = channelsPre.filter(function (item) {
                return item.name == channel.name
            })
            channel.totalPre = 0
            if (tars.length > 0) {
                channel.totalPre = tars[0].total
            }
            delete channel.list
        })
        dataSet.push(channels)

        //团队毛利
        
        var maoliTbl = []
        var shijimaoli = []
        var shijishouru = []
        var yusuanmaoli = [29.6 * 10000, 138.8 * 10000, 37.9 * 10000, 63.4 * 10000, 64.1 * 10000, 62 * 10000, 140.6 * 10000, 169.1 * 10000, 72.5 * 10000, 126.8 * 10000, 44.6 * 10000, 58.8 * 10000, 1008.2 * 10000]
        yusuanmaoli.forEach(function (ele) {
            ele = ele * 10000
        })
        var yusuanshouru = [258 * 10000, 1085 * 10000, 271 * 10000, 451 * 10000, 470 * 10000, 435 * 10000, 955 * 10000, 1095 * 10000, 525 * 10000, 865 * 10000, 340 * 10000, 450 * 10000, 7200 * 10000]
        var wanchenglv = []
        var shijimaolilv = []
        var jihuamaolilv = ['11%', '13%', '14%', '14%', '14%', '14%', '15%', '15%', '14%', '15%', '13%', '13%', '14.00%']
        var shijimaoliLast = []
        for (var i = 1; i <= 12; i++) {
            var month = year.toString() + (i < 10 ? "0" : "") + i
            var monthLast = yearLast.toString() + (i < 10 ? "0" : "") + i

            var tars = group.filter(function (ele) {
                return ele["团号月"] == month&&ele["团队结算状态"]=='完成'
            })

            var tarsLast = groupLast.filter(function (ele) {
                return ele["团号月"] == monthLast&&ele["团队结算状态"]=='完成'
            })
            var subTotal = 0
            var subTotal2 = 0
            var subTotal3 = 0
            tars.forEach(function (ele) {
                subTotal += ele["调整后计划毛利额"]
                subTotal2 += ele["调整后计划收入"]
            })
            tarsLast.forEach(function (ele) {
                subTotal3 += ele["实际毛利额"]
            })
            shijimaoli.push(Math.round(subTotal))
            shijishouru.push(Math.round(subTotal2))
            wanchenglv.push(((subTotal * 1.0 / yusuanmaoli[i - 1]) * 100).toFixed(2) + "%")
            shijimaolilv.push(subTotal2 == 0 ? "0%" : ((subTotal * 1.0 / subTotal2) * 100).toFixed(2) + "%")
            shijimaoliLast.push(Math.round(subTotal3))
        }
        maoliTbl.push(shijimaoli)
        maoliTbl.push(shijishouru)
        maoliTbl.push(yusuanmaoli)
        maoliTbl.push(yusuanshouru)
        maoliTbl.push(wanchenglv)
        maoliTbl.push(shijimaolilv)
        maoliTbl.push(jihuamaolilv)
        maoliTbl.push(shijimaoliLast)
        dataSet.push(maoliTbl)

        ri.succ(dataSet)
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri;
});

router.get('/:year/seller', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var year = parseInt(ctx.params.year)
        var rs = await dao.mssql.getOrdersByYear(year)

    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
});

router.get('/detail/:orderNo', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var orderNo = ctx.params.orderNo
        var rs = await dao.mssql.getDetailByOrderNo(orderNo)
        ri.succ(rs)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
});

router.get('/detail/:orderNo/simple', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var orderNo = ctx.params.orderNo
        var rs = await dao.mssql.getSimpleByOrderNo(orderNo)
        if (rs != '') {
            ri.succ(rs)
        }
        else {
            ri.error('没有数据')
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
});


module.exports = router