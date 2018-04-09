const Router = require('koa-router')
const moment = require('moment');
const router = new Router({
    prefix: '/udesk'
});
const ResultInfo = require('../common/ResultInfo')
const ticketCus = require('../common/ticket-cus-fields')
const customerCfs = require('../common/customer_custom_fields')
const udeskDAO = {
    webapi: require('../daos/webapi/udeskDAO'),
    mongodb: require('../daos/mongodb/udeskDAO')
}
const orderDAO = {
    mssql: require('../daos/mssql/orderDAO'),
}
const dicts = require('../common/dists')

//查询工单列表
router.get('/tickets', async function (ctx, next) {
    var ri = new ResultInfo()
    var pageNo = ctx.query.pageNo ? parseInt(ctx.query.pageNo) : 1
    var pageSize = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : 20
    var ticketId = ctx.query.ticketId ? parseInt(ctx.query.ticketId) : 0
    var userCellphone = ctx.query.userCellphone || ''
    var subject = ctx.query.subject || ''
    var fieldNum = ctx.query.fieldNum || ''
    var groupNo = ctx.query.groupNo || ''
    var orderNo = ctx.query.orderNo || ''
    var statusId = ctx.query.statusId || ''
    var isHasOrder = ctx.query.isHasOrder ? parseInt(ctx.query.isHasOrder) : 0
    var customerId = ctx.query.customerId ? parseInt(ctx.query.customerId) : 0
    var agentId = ctx.query.agentId ? parseInt(ctx.query.agentId) : 0
    var query = {}
    if (ticketId > 0) {
        query["ticket.id"] = ticketId
    }
    if (statusId != '') {
        query["ticket.custom_fields.SelectField_5189"] = statusId
    }
    if (userCellphone != '') {
        query["ticket.user_cellphone"] = userCellphone
    }
    if (subject != '') {
        query["ticket.subject"] = new RegExp(subject)
    }
    if (fieldNum != '') {
        query["ticket.field_num"] = '#' + fieldNum
    }
    if (groupNo != '') {
        query["order.0.团号"] = groupNo
    }
    if (customerId > 0) {
        query["ticket.user_id"] = customerId
    }
    if (orderNo != '') {
        query["order.0.订单编号"] = orderNo
    }
    else if (isHasOrder == 1) {
        query["order"] = { $exists: true }
    }
    if (agentId > 0) {
        query["ticket.assignee_id"] = agentId
    }
    try {
        var t1 = new Date()
        var rs = await udeskDAO.mongodb.ticket.search(query, pageNo, pageSize)
        var t2 = new Date()
        console.log('[' + t1 + ']调用[udeskDAO.mongodb.ticket.search]用时：' + (t2 - t1))
        ri.succ(rs)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
});

router.get('/tickets/daysago', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var dateNow = moment()
        var days = parseInt(ctx.query.days)
        var dateAfter = dateNow.add(-days, 'days').toDate()
        var query = { "ticket.created_at": { $gte: dateAfter } }
        var fields = { 'ticket.created_at': 1 }
        var rowNum = 100
        var rs = await udeskDAO.mongodb.ticket.find(query, fields, rowNum)
        if (rs && rs.length > 0) {
            var result = []
            for (var i = 0; i < days; i++) {
                var date = moment(dateAfter)
                date.add(i, 'days')
                date = date.format('YYYY-MM-DD')
                var arr = rs.filter(function (ele) {
                    var created_at = moment(ele.ticket.created_at).format('YYYY-MM-DD')
                    return date == created_at
                })
                result.push({ 'date': date, 'count': arr.length })
            }
            ri.succ(result)
        }
        else {
            ri.message('没有数据')
        }
    } catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri;
})

router.get('/tickets/daysagoupdate', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var dateNow = moment()
        var days = parseInt(ctx.query.days)
        var dateAfter = dateNow.add(-days, 'days').toDate()
        var query = { "ticket.updated_at": { $gte: dateAfter } }
        var fields = {
            "ticket.assignee_name": 1,
            "ticket.custom_fields": 1,
            "ticket.created_at": 1,
            "ticket.subject": 1,
            "ticket.user_name": 1,
            "ticket.updated_at": 1
        }
        var rowNum = 1000


        var rs = await udeskDAO.mongodb.ticket.find(query, fields, rowNum)
        if (rs && rs.length > 0) {
            var result = []
            var allCus = await udeskDAO.mongodb.ticket.getCusFieldList({})
            ticketCus.init(allCus)
            rs.forEach(function (ele) {
                ele.ticket['Operator'] = ticketCus.getCusFieldVal(ticketCus.Operator, ele.ticket.custom_fields[ticketCus.Operator]) || '无'
                ele.ticket['Source'] = ticketCus.getCusFieldVal(ticketCus.Source, ele.ticket.custom_fields[ticketCus.Source])
                ele.ticket['DestinationMarket'] = ticketCus.getCusFieldVal(ticketCus.DestinationMarket, ele.ticket.custom_fields[ticketCus.DestinationMarket])
                ele.ticket['DepartureDate'] = ticketCus.getCusFieldVal(ticketCus.DepartureDate, ele.ticket.custom_fields[ticketCus.DepartureDate])
                ele.ticket['TravellerAmount'] = ticketCus.getCusFieldVal(ticketCus.TravellerAmount, ele.ticket.custom_fields[ticketCus.TravellerAmount])
                ele.ticket['CancelReason'] = ticketCus.getCusFieldVal(ticketCus.CancelReason, ele.ticket.custom_fields[ticketCus.CancelReason])
                ele.ticket['CancelReasonExt'] = ticketCus.getCusFieldVal(ticketCus.CancelReasonExt, ele.ticket.custom_fields[ticketCus.CancelReasonExt])
                ele.ticket['TicketStatus'] = ticketCus.getCusFieldVal(ticketCus.TicketStatus, ele.ticket.custom_fields[ticketCus.TicketStatus])
                ele.ticket['created_at'] = moment(ele.ticket['created_at']).format('YYYY-MM-DD HH:mm:ss')
                ele.ticket['updated_at'] = moment(ele.ticket['updated_at']).format('YYYY-MM-DD HH:mm:ss')
                delete ele.ticket.custom_fields
                result.push(ele.ticket)
            })
            result.sort(function (a, b) {
                return b.Operator.localeCompare(a.Operator)
            })
            ri.succ(result)
        }
        else {
            ri.message('没有数据')
        }
    } catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri;
})
//根据页码同步工单列表
router.post('/tickets/save', async function (ctx, next) {
    var ri = new ResultInfo()
    var pageNo = ctx.query.pageNo ? parseInt(ctx.query.pageNo) : 1
    var pageSize = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : 20
    try {
        var t1 = new Date()
        var res = await udeskDAO.webapi.ticket.getAll(pageNo, pageSize)
        var t2 = new Date()
        console.log('[' + t1 + ']调用[udeskDAO.webapi.ticket]用时：' + (t2 - t1))
        if (res.code == 1000) {
            var meta = res.meta
            var list = res.contents
            if (list.length > 0) {
                var succCount = 0
                for (var i = 0, len = list.length; i < len; i++) {
                    var item = list[i]
                    t1 = new Date()
                    res = await udeskDAO.mongodb.ticket.saveDetail(item)
                    t2 = new Date()
                    console.log('[' + t1 + ']调用[udeskDAO.mongodb.ticket.saveDetail]用时：' + (t2 - t1))
                    if (res.result.ok == 1) {
                        succCount++
                    }
                }
                if (list.length == succCount) {
                    ri.succ({ meta: meta, result: succCount }, "同步成功")
                }
                else {
                    ri.error('同步失败，共' + list.length + '条数据，成功更新' + succCount + '条数据')
                }
            }
            else {
                ri.error('当前没有需要更新的数据')
            }
        }
        else {
            ri.err(res.message)
        }

    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//根据筛选器id同步工单数据列表
router.post('/tickets/save/:filterId', async function (ctx, next) {
    var ri = new ResultInfo()
    var filterId = ctx.params.filterId ? parseInt(ctx.params.filterId) : 0
    var pageNo = ctx.query.pageNo ? parseInt(ctx.query.pageNo) : 1
    var pageSize = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : 20
    if (filterId == 0) {
        ri.error("缺少参数filterId")
    }
    else {
        try {
            var t1 = new Date()
            var res = await udeskDAO.webapi.ticket.getByFilterId(filterId, pageNo, pageSize)
            var t2 = new Date()
            console.log('[' + t1 + ']调用[udeskDAO.webapi.ticket.getByFilterId]用时：' + (t2 - t1))
            if (res.code == 1000) {
                var meta = res.meta
                var list = res.contents
                if (list.length > 0) {
                    var succCount = 0
                    for (var i = 0, len = list.length; i < len; i++) {
                        var item = list[i]
                        t1 = new Date()
                        if (item.ticket.created_at) {
                            item.ticket.created_at = new Date(item.ticket.created_at)
                        }
                        if (item.ticket.updated_at) {
                            item.ticket.updated_at = new Date(item.ticket.updated_at)
                        }
                        if (!item.pointer) {
                            item.pointer = { "id": item.ticket.user_id, "name": item.ticket.user_name }
                        }
                        var orderNo = item.order && item.order.length > 0 ? item.order[0]['订单编号'] : ''
                        // if (orderNo) {
                        //     var order = await orderDAO.mssql.getSimpleByOrderNo(orderNo)
                        //     if (order) {
                        //         if (order['出发日期']) {
                        //             order['出发日期'] = new Date(order['出发日期'])
                        //         }
                        //         if (order['返回日期']) {
                        //             order['返回日期'] = new Date(order['返回日期'])
                        //         }
                        //         item['order'] = order
                        //     }
                        // }
                        let user_id = item.ticket.user_id
                        let customer = await udeskDAO.mongodb.customer.getDetailById(user_id)
                        if (!customer) {
                            var customerData = await udeskDAO.webapi.customer.getDetailById(user_id)
                            if (customerData.code == 1000) {
                                customer = customerData.customer
                                let rs = await udeskDAO.mongodb.customer.saveDetail(customer)
                                console.log('同步客户信息到本地')
                            }
                            else {
                                console.log(customerDatares.message)
                            }
                        }
                        res = await udeskDAO.mongodb.ticket.saveDetail(item)
                        udeskDAO.mongodb.customer.addTicket(user_id, item.ticket.id, orderNo)
                        t2 = new Date()
                        console.log('[' + t1 + ']调用[udeskDAO.mongodb.ticket.saveDetail]用时：' + (t2 - t1))
                        if (res.result.ok == 1) {
                            succCount++
                        }
                    }
                    if (list.length == succCount) {
                        ri.succ({ meta: meta, result: succCount }, "同步成功")
                    }
                    else {
                        ri.error('同步失败，共' + list.length + '条数据，成功更新' + succCount + '条数据')
                    }
                }
                else {
                    ri.error('当前没有需要更新的数据')
                }
            }
            else {
                ri.err(res.message)
            }
        }
        catch (err) {
            ri.error(err)
        }
    }

    ctx.response.body = ri;
})

//根据工单id获取工单详情
router.get('/tickets/detail/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = ctx.params.id ? parseInt(ctx.params.id) : 0
        var query = {}
        if (id > 0) {
            query["ticket.id"] = id
        }
        var res = await udeskDAO.mongodb.ticket.getTicketById(query)
        var allcfs = await udeskDAO.mongodb.ticket.getCusFieldList({})
        ticketCus.init(allcfs)
        var statusId = parseInt(res.ticket.custom_fields[ticketCus.TicketStatus])
        var statusTxt = ticketCus.getCusFieldVal(ticketCus.TicketStatus, statusId)
        res.ticket.statusId = statusId
        res.ticket.statusTxt = statusTxt
        var assignee_id = res.ticket.assignee_id
        var agent = await udeskDAO.mongodb.agent.get({ 'id': assignee_id })
        res.agent = agent
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})



//根据工单id同步工单数据
router.post('/tickets/detail/save/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = ctx.params.id
        var t1 = new Date()
        var res = await udeskDAO.webapi.ticket.getTicketById(id)
        var t2 = new Date()
        console.log('[' + t1 + ']调用[udeskDAO.webapi.ticket.getTicketById]用时：' + (t2 - t1))
        if (res.code == 1000) {
            var ticket = res.ticket
            var item = { 'ticket': ticket }
            t1 = new Date()
            if (item.ticket.created_at) {
                item.ticket.created_at = new Date(item.ticket.created_at)
            }
            if (item.ticket.updated_at) {
                item.ticket.updated_at = new Date(item.ticket.updated_at)
            }
            if (!item.pointer) {
                item.pointer = { "id": item.ticket.user_id, "name": item.ticket.user_name }
            }
            var orderNo = item.order && item.order.length > 0 ? item.order[0]['订单编号'] : ''
            let user_id = item.ticket.user_id
            let customer = await udeskDAO.mongodb.customer.getDetailById(user_id)
            if (!customer) {
                var customerData = await udeskDAO.webapi.customer.getDetailById(user_id)
                if (customerData.code == 1000) {
                    customer = customerData.customer
                    let rs = await udeskDAO.mongodb.customer.saveDetail(customer)
                    console.log('同步客户信息到本地')
                }
                else {
                    console.log(customerDatares.message)
                }
            }
            res = await udeskDAO.mongodb.ticket.saveDetail(item)
            udeskDAO.mongodb.customer.addTicket(user_id, item.ticket.id, orderNo)
            t2 = new Date()
            console.log('[' + t1 + ']调用[udeskDAO.mongodb.ticket.save]用时：' + (t2 - t1))
            ri.succ({ result: res.result }, "同步成功")
            // var orderNo = item.ticket.custom_fields[ticketCus.OrderNo] || ''
            // if (orderNo) {
            //     var ds = await orderDAO.mssql.getDetailByOrderNo(orderNo)
            //     var order = ds && ds.length > 0 && ds[0].length > 0 ? ds[0][0] : ''
            //     if (order) {
            //         if (order['出发日期']) {
            //             order['出发日期'] = new Date(order['出发日期'])
            //         }
            //         if (order['返回日期']) {
            //             order['返回日期'] = new Date(order['返回日期'])
            //         }
            //         item['order'] = order
            //     }
            //     var travellers = ds && ds.length > 1 ? ds[1] : ''
            //     if (travellers) {
            //         for (var i = 0, len = travellers.length; i < len; i++) {
            //             var traveller = travellers[i]
            //             var item = {
            //                 id: 0,
            //                 nick_name: traveller['出行人姓氏'] + ' ' + traveller['出行人名称'],
            //                 pin_yin_xing: traveller['出行人姓氏'],
            //                 pin_yin_ming: traveller['出行人名称'],
            //                 gender: traveller['性别'] == '男' ? 1 : 2,
            //                 cellphone: '',
            //                 id_card_type: '',
            //                 id_card_type_txt: traveller['证件类型'],
            //                 id_card_no: traveller['证件号码'],
            //                 room_no: '',
            //                 remark: '',
            //                 issue_at: '',
            //                 issue_at_txt: traveller['出行人签发地'],
            //                 issue_date: traveller['出行人签发日期'],
            //                 expire_date: traveller['出行人有效期'],
            //                 birthday: traveller['生日'],
            //                 birth_place: '',
            //                 birth_place_txt: '',
            //                 visa_type: '',
            //                 visa_type_txt: traveller['出行人旅游证件类型'],
            //                 visa_no: traveller['出行人旅游证件号']
            //             }
            //         }
            //         item['travellers'] = travellers
            //     }

            // }
            // else {
            //     ri.error(res.message)
            // }
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//修改工单自定义字段的值，并同步
router.post('/tickets/detail/update/:id/cusfield', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var ticketId = ctx.params.id
        var cfs = ctx.request.body.cfs
        var res = await udeskDAO.webapi.ticket.updateCusFields(ticketId, cfs)
        if (res.code == 1000) {
            var ticket = res.ticket
            udeskDAO.mongodb.ticket.save(ticket)
            ri.succ(res.ticket)
        }
        else {
            ri.error(res.message)
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//获取工单自定义字段列表
router.get('/tickets/cusfields', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var res = await udeskDAO.mongodb.ticket.getCusFieldList()
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//根据工单自定义字段名称获取自定义字段
router.get('/tickets/cusfields/:field_name', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var field_name = ctx.params.field_name
        var res = await udeskDAO.mongodb.ticket.getCusFieldByName(field_name)
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//根据工单自定义字段名称获取自定义字段的选项值，只针对select和checkbox
router.get('/tickets/cusfields/:field_name/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var field_name = ctx.params.field_name
        var opId = ctx.params.id
        var res = await udeskDAO.mongodb.ticket.getCusFieldByName(field_name)
        if (res && res.options) {
            var tars = res.options.filter(function (item) {
                return item[opId] != undefined
            })
            if (tars.length > 0) {
                ri.succ(tars[0][opId])
            }
            else {
                ri.error('没有数据')
            }
        }
        else {
            ri.error('没有数据')
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//同步工单自定义字段列表
router.post('/tickets/cusfields/save', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var res = await udeskDAO.webapi.ticket.getAllCusFields()
        if (res.code == 1000) {
            var cusfields = res.ticket_custom_fields
            var rs = await udeskDAO.mongodb.ticket.saveCusFieldList(cusfields)
            ri.succ(rs.result)
        }
        else {
            ri.error(res.message)
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/tickets/del', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var res = await udeskDAO.mongodb.ticket.delTickets()
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})
//积分计算方法
router.post('/tickets/calc', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        //获取待计算积分的工单
        var date = new Date()
        date = date.setDate(date.getDate() - 1)
        date = new Date(date)
        var query = {
            'ticket.updated_at': { $gt: date },//当天更新过的
            'order': { $exists: true },//绑定了订单数据的
            'pointer.id': { $gt: 0 },//绑定了积分人的
            'is_point_calced': { $ne: 1 },//没有计算过积分的
            'ticket.custom_fields.SelectField_5189': { $in: ['4', '5', '11'] }//工单状态是4: "已支付"，5: "已出行"，11: "已回访"的
        }
        var tickets = await udeskDAO.mongodb.ticket.find(query)
        var calced_tickets = []//返回计算过的工单id
        for (var i = 0, len = tickets.length; i < len; i++) {
            var item = tickets[i]
            var order = item.order[0]//订单信息
            var orderNo = order['订单编号']
            var statusId = item.ticket.custom_fields.SelectField_5189//工单状态
            var customerId = item.pointer.id  //item.ticket.user_id//客户id, 2018-03-19 13:54:41改为使用指定的积分人
            var typeId = 1//为订单积分
            var points = 0//积分值
            var cost = order['实收金额'] || 0//订单金额
            var desc = '系统自动生成'
            if (cost > 0) {
                var rate = 100//积分生成比率
                points = Math.ceil(cost / rate) //计算本次计算的积分
                var res = await udeskDAO.mongodb.customer.addPoint(customerId, typeId, points, orderNo, cost, desc)
                item.is_point_calced = 1
                res = await udeskDAO.mongodb.ticket.update(item.ticket.id, { 'is_point_calced': 1 })
                calced_tickets.push(item.ticket.id)
            }
        }
        ri.succ(calced_tickets)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/tickets/traveller/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var ticketId = parseInt(ctx.params.id)
        var travellers = ctx.request.body.travellers
        var res = await udeskDAO.mongodb.ticket.saveTravellers(ticketId, travellers)
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

//根据工单id获取工单详情
router.get('/tickets/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = ctx.params.id ? parseInt(ctx.params.id) : 0
        var query = {}
        if (id > 0) {
            query["ticket.id"] = id
        }
        var res = await udeskDAO.mongodb.ticket.getTicketById(query)
        var allcfs = await udeskDAO.mongodb.ticket.getCusFieldList({})
        ticketCus.init(allcfs)
        var statusId = parseInt(res.ticket.custom_fields[ticketCus.TicketStatus])
        var statusTxt = ticketCus.getCusFieldVal(ticketCus.TicketStatus, statusId)
        res.ticket.statusId = statusId
        res.ticket.statusTxt = statusTxt
        var assignee_id = res.ticket.assignee_id
        var agent = await udeskDAO.mongodb.agent.get({ 'id': assignee_id })
        res.agent = agent
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/tickets/:id/update', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var ticketId = parseInt(ctx.params.id)
        var updateData = ctx.request.body
        var res = await udeskDAO.mongodb.ticket.update(ticketId, updateData)
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/tickets/:id/bindorder', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var ticketId = parseInt(ctx.params.id)
        var ticketData = await udeskDAO.mongodb.ticket.getTicketById({ 'ticket.id': ticketId })
        var orderNo = ctx.request.body.orderNo || ''
        if (orderNo) {
            var ds = await orderDAO.mssql.getDetailByOrderNo(orderNo)
            var order = ds && ds.length && ds[0].length > 0 > 0 ? ds[0][0] : ''
            if (order) {
                if (order['出发日期']) {
                    order['出发日期'] = new Date(order['出发日期'])
                }
                if (order['返回日期']) {
                    order['返回日期'] = new Date(order['返回日期'])
                }
                order['联系电话'] = ticketData.ticket.user_cellphone
                order['联系邮箱'] = ticketData.ticket.user_email
                order['联系人'] = ticketData.ticket.user_name
            }
            var list = ds && ds.length > 1 ? ds[1] : ''
            var travellers = []
            if (list) {
                for (var i = 0, len = list.length; i < len; i++) {
                    var traveller = list[i]
                    var item = {
                        id: i,
                        nick_name: traveller['出行人姓名'],
                        pin_yin_xing: traveller['出行人姓氏'],
                        pin_yin_ming: traveller['出行人名称'],
                        gender: traveller['性别'] == '男' ? 1 : 2,
                        cellphone: '',
                        id_card_type: '',
                        id_card_type_txt: dicts.getTxt(1, traveller['证件类型']),
                        id_card_no: traveller['证件号码'],
                        room_no: '',
                        remark: '',
                        issue_at: '',
                        issue_at_txt: traveller['出行人签发地'],
                        issue_date: traveller['出行人签发日期'],
                        expire_date: traveller['出行人有效期'],
                        birthday: traveller['生日'],
                        birth_place: '',
                        birth_place_txt: '',
                        visa_type: '',
                        visa_type_txt: traveller['出行人旅游证件类型'],
                        visa_no: traveller['出行人旅游证件号']
                    }
                    travellers.push(item)
                }
            }
            var updateData = { order: [order] }
            if (ticketData.travellers == undefined || ticketData.travellers.length == 0) {
                updateData['travellers'] = travellers
            }
            var res = await udeskDAO.mongodb.ticket.update(ticketId, updateData)
            ri.succ(res)
        }
        else {
            ri.error('缺少参数orderNo')
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/tickets/:id/unbindorder', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var ticketId = parseInt(ctx.params.id)
        var updateData = { order: '' }
        var res = await udeskDAO.mongodb.ticket.removeField(ticketId, updateData)
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/tickets/:id/payment', async function (ctx, next) {
    var ri = new ResultInfo()
    var ticketId = parseInt(ctx.params.id) || 0
    var payment = ctx.request.body
    if (ticketId == 0) {
        ri.error('参数错误')
    }
    else {
        try {
            let ticketId = parseInt(ctx.params.id)
            let ticketData = await udeskDAO.mongodb.ticket.getTicketById({ 'ticket.id': ticketId })
            if (ticketData) {
                let payments = ticketData.payments || []
                let timeNow = new Date()
                payment['payment_no'] = "SP" + ticketId + moment(timeNow).format("HHmmssSSS") + payment.method_id
                payment['status_id'] = 1
                payment['created_at'] = timeNow
                payment['updated_at'] = timeNow
                payments.push(payment)
                let rs = await udeskDAO.mongodb.ticket.update(ticketId, { 'payments': payments })
                if (rs.result.ok) {
                    ri.succ(payment)
                }
                else {
                    ri.error('新增支付信息失败')
                }
            }
            else {
                ri.error('未查到工单数据')
            }
        }
        catch (err) {
            ri.error(JSON.stringify(err))
        }
    }
    ctx.response.body = ri;
})

router.post('/tickets/:id/payment/:pno/succ', async function (ctx, next) {
    var ri = new ResultInfo()
    var ticketId = parseInt(ctx.params.id) || 0
    var payment_no = ctx.params.pno || ''
    var item = ctx.request.body
    item['status_id'] = 2
    if (ticketId == 0) {
        ri.error('缺少参数:id')
    }
    else if (payment_no == '') {
        ri.error('缺少参数:pno')
    }
    else {
        try {
            let ticketId = parseInt(ctx.params.id)
            let ticketData = await udeskDAO.mongodb.ticket.getTicketById({ 'ticket.id': ticketId })
            if (ticketData) {
                let payments = ticketData.payments || []
                let index = payments.findIndex(function (ele) {
                    return ele.payment_no == payment_no
                })
                if (index >= 0) {
                    let updateData = {}
                    for (let key in item) {
                        updateData['payments.' + index + '.' + key] = item[key]
                        payments[index][key] = item[key]
                    }
                    let rs = await udeskDAO.mongodb.ticket.update(ticketId, updateData)
                    let cfs = {}
                    cfs[ticketCus.TicketStatus] = item['status_id']
                    udeskDAO.webapi.ticket.updateCusFields(ticketId, cfs)
                    if (rs.result.ok) {
                        ri.succ(ticketData, '支付信息修改成功')
                    }
                    else {
                        ri.error('支付信息修改失败')
                    }
                }
                else {
                    ri.error('未查到支付信息')
                }
            }
            else {
                ri.error('未查到工单数据')
            }
        }
        catch (err) {
            ri.error(JSON.stringify(err))
        }
    }
    ctx.response.body = ri;
})

router.post('/tickets/add', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var ticket = ctx.request.body
        var res = await udeskDAO.webapi.ticket.add(ticket)
        if (res.code == 1000) {
            ri.succ("", res.message)
        }
        else {
            ri.error(res.message)
        }
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri;
})

router.post('/tickets/:id/delete', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var ticketId = parseInt(ctx.params.id)
        var rs = await udeskDAO.mongodb.ticket.deleteOne(ticketId)
        if (rs.result.ok == 1) {
            ri.succ(rs.deletedCount)
        }
        else {
            ri.error('删除失败')
        }
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri;
})

router.post('/tickets/deleteMany', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var ticketIds = ctx.request.body.ticketIds
        var rs = await udeskDAO.mongodb.ticket.deleteMany(ticketIds)
        if (rs.result.ok == 1) {
            ri.succ(rs.deletedCount)
        }
        else {
            ri.error('删除失败')
        }
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri;
})

router.get('/customers', async function (ctx, next) {
    var ri = new ResultInfo()
    var pageNo = ctx.query.pageNo ? parseInt(ctx.query.pageNo) : 1
    var pageSize = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : 20
    var id = ctx.query.id ? parseInt(ctx.query.id) : 0
    var nick_name = ctx.query.nickName || ""
    var cellphone = ctx.query.cellphone || ""
    var isHasTickets = ctx.query.isHasTickets ? parseInt(ctx.query.isHasTickets) : 0
    var query = {}
    if (id) {
        query["id"] = id
    }
    if (nick_name) {
        query["nick_name"] = new RegExp(nick_name)
    }
    if (cellphone) {
        query["cellphones"] = { "$elemMatch": { "content": cellphone } }
    }
    if (isHasTickets) {
        query["tickets"] = { $exists: true }
    }
    try {
        var t1 = new Date()
        var result = await udeskDAO.mongodb.customer.search(query, pageNo, pageSize)
        var t2 = new Date()
        console.log('[' + t1 + ']调用[udeskDAO.mongodb.customer.search]用时：' + (t2 - t1))
        var customers = result.list
        t1 = new Date()
        var agents = await udeskDAO.mongodb.agent.search({})
        t2 = new Date()
        console.log('[' + t1 + ']调用[udeskDAO.mongodb.agent.search]用时：' + (t2 - t1))
        for (var i = 0, len = customers.length; i < len; i++) {
            var customer = customers[i]
            var agentId = customer.owner_id
            for (var j = 0, lenj = agents.length; j < lenj; j++) {
                var agent = agents[j]
                if (agent.id == agentId) {
                    customer.owner_name = agent.nick_name
                }
            }
        }
        ri.succ(result)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})
router.post('/customers', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var query = ctx.request.body.query
        var fields = ctx.request.body.fields || {}
        var count = ctx.request.body.count || 10
        if (query) {
            var rs = await udeskDAO.mongodb.customer.find(query, fields, count)
            ri.succ(rs)
        }
        else {
            ri.error('缺少查询条件')
        }
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri
})
router.post('/customers/del', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var res = await udeskDAO.mongodb.customer.del()
        ri.succ(res)
    }
    catch (e) {
        ri.error(e)
    }
    ctx.response.body = ri;
})

router.post('/customers/save', async function (ctx, next) {
    var ri = new ResultInfo()
    var pageNo = ctx.query.pageNo ? parseInt(ctx.query.pageNo) : 1
    var pageSize = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : 20
    try {
        var t1 = new Date()
        var res = await udeskDAO.webapi.customer.getAll(pageNo, pageSize)
        var t2 = new Date()
        console.log('[' + t1 + ']调用[udeskDAO.webapi.customer.getAll]用时：' + (t2 - t1))
        if (res.code == 1000) {
            var meta = res.meta
            var list = res.customers
            if (list.length > 0) {
                t1 = new Date()
                res = await udeskDAO.mongodb.customer.saveMany(list)
                t2 = new Date()
                console.log('[' + t1 + ']调用[udeskDAO.mongodb.customer.saveMany]用时：' + (t2 - t1))
                ri.succ({ meta: meta, result: res.result }, "同步成功")
            }
            else {
                ri.error('当前没有需要更新的数据')
            }
        }
        else {
            ri.err(res.message)
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/customers/save/:filterId', async function (ctx, next) {
    var ri = new ResultInfo()
    var filterId = ctx.params.filterId ? parseInt(ctx.params.filterId) : 0
    var pageNo = ctx.query.pageNo ? parseInt(ctx.query.pageNo) : 1
    var pageSize = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : 20
    if (filterId == 0) {
        ri.error("缺少参数filterId")
    }
    else {
        try {
            var res = await udeskDAO.webapi.customer.getByFilterId(filterId, pageNo, pageSize)
            if (res.code == 1000) {
                var meta = res.meta
                var list = res.customers
                if (list.length > 0) {
                    var total = list.length
                    var succCount = 0
                    for (var i = 0; i < total; i++) {
                        var item = list[i]
                        res = await udeskDAO.mongodb.customer.saveDetail(item)
                        if (res.result.ok == 1) {
                            succCount++
                        }
                    }
                    if (total == succCount) {
                        ri.succ({ meta: meta, result: succCount }, "同步成功")
                    }
                    else {
                        ri.error("总计" + total + "条数据待同步，成功同步" + succCount + "条数据")
                    }
                }
                else {
                    ri.error('当前没有需要更新的数据')
                }
            }
            else {
                ri.err(res.message)
            }
        }
        catch (err) {
            ri.error(err)
        }
    }

    ctx.response.body = ri;
})

router.get('/customers/detail/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    var id = parseInt(ctx.params.id)
    try {
        var res = await udeskDAO.mongodb.customer.getDetailById(id)
        if (res) {
            ri.succ(res)
        }
        else {
            ri.error("没有数据")
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.get('/customers/detail/:id/extinfo', async function (ctx, next) {
    var ri = new ResultInfo()
    var id = parseInt(ctx.params.id)
    try {
        var res = await udeskDAO.mongodb.customer.getDetailById(id)
        if (res && res.ext_info) {
            ri.succ(res.ext_info)
        }
        else {
            ri.error("没有数据")
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/customers/detail/:id/save', async function (ctx, next) {
    var ri = new ResultInfo()
    var id = ctx.params.id
    try {
        var res = await udeskDAO.webapi.customer.getDetailById(id)
        if (res.code == 1000) {
            var item = res.customer
            res = await udeskDAO.mongodb.customer.saveDetail(item)
            ri.succ({ item }, "同步成功")
        }
        else {
            ri.err(res.message)
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/customers/cusfields/save', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var res = await udeskDAO.webapi.customer.getAllCusFields()
        if (res.code == 1000) {
            var list = res.custom_fields
            res = await udeskDAO.mongodb.customer.cusfieldSaveMany(list)
            if (res.result.ok == 1) {
                ri.succ(res.result)
            }
            else {
                ri.error(res.result)
            }
        }
        else {
            ri.error(res.message)
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.get('/customers/cusfields', async function (ctx, next) {
    var ri = new ResultInfo()
    var field_name = ctx.query.fieldName || ''
    var query = {}
    if (field_name) {
        query['field_name'] = field_name
    }
    try {
        var res = await udeskDAO.mongodb.customer.searchCusFields(query)
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/customers/pointtypes/save', async function (ctx, next) {
    var ri = new ResultInfo()
    var typeName = ctx.request.body.typeName || ''
    var pointValue = ctx.request.body.pointValue || ''
    var desc = ctx.request.body.desc || ''
    if (typeName == '') {
        ri.error('缺少参数typeName')
    } else if (pointValue == '') {
        ri.error('缺少参数pointValue')
    } else if (desc == '') {
        ri.error('缺少参数desc')
    }
    else {
        try {
            var res = await udeskDAO.mongodb.customer.addPointType(typeName, pointValue, desc)
            ri.succ(res)
        }
        catch (err) {
            ri.error(err)
        }
    }
    ctx.response.body = ri;
})

router.get('/customers/pointtypes', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var res = await udeskDAO.mongodb.customer.getPointType()
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/customers/points/add', async function (ctx, next) {
    var ri = new ResultInfo()
    var customerId = ctx.request.body.customerId ? parseInt(ctx.request.body.customerId) : 0
    var typeId = ctx.request.body.typeId ? parseInt(ctx.request.body.typeId) : 0
    var points = ctx.request.body.points ? parseInt(ctx.request.body.points) : 0
    var cost = ctx.request.body.cost ? parseInt(ctx.request.body.cost) : 0
    var refNo = ctx.request.body.refNo || ''
    var desc = ctx.request.body.desc || ''
    if (customerId == 0) {
        ri.error('缺少参数 customerId')
    } else if (typeId == 0) {
        ri.error('缺少参数 typeId')
    } else if (points == 0) {
        ri.error('缺少参数 points')
    }
    else {
        try {
            var res = await udeskDAO.mongodb.customer.addPoint(customerId, typeId, points, refNo, cost, desc)
            ri.succ(res)
        }
        catch (err) {
            ri.error(err)
        }
    }

    ctx.response.body = ri;
})

router.post('/customers/extinfo/save/:id', async function (ctx, next) {
    var id = parseInt(ctx.params.id)
    var extInfo = ctx.request.body
    var ri = new ResultInfo()
    try {
        var res = await udeskDAO.mongodb.customer.saveExtInfo(id, extInfo)
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.get('/customers/levels', function (ctx, next) {
    var ri = new ResultInfo()
    try {
        ri.succ(udeskDAO.mongodb.CUSTOMER_LEVEL)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/customers/add', async function (ctx, next) {
    var ri = new ResultInfo()
    var item = ctx.request.body
    if (item.customer.cellphones[0][1] == '') {
        delete item.customer.cellphones
    }
    try {
        var res = await udeskDAO.webapi.customer.add(item)
        if (res.code = 1000) {
            var customer = res.customer
            customer.tags = []
            res = await udeskDAO.mongodb.customer.saveDetail(customer)
            if (res.result.ok == 1) {
                ri.succ(customer.id)
            }
            else {
                ri.error('新增失败')
            }
        }
        else {
            ri.error(res.message)
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/customers/:id/update', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var updateData = ctx.request.body
        var res = await udeskDAO.mongodb.customer.update(id, updateData)
        if (updateData.ext_info != undefined) {
            var cfs = {}
            cfs[customerCfs["基本信息-出生日期"]] = updateData.ext_info.birthday || ''
            cfs[customerCfs["基本信息-婚姻状况"]] = [updateData.ext_info.is_married || ""]
            cfs[customerCfs["基本信息-性别"]] = updateData.ext_info.gender == "1" ? ["0"] : (updateData.ext_info.gender == "2" ? ["1"] : "")
            let tmp = await udeskDAO.webapi.customer.updateCusFields(id, cfs)
        }

        ri.succ(res.result)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.get('/customers/:id/tickets_as_traveller', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var query = { 'travellers': { $all: [{ $elemMatch: { "id": id } }] } }
        let list = await udeskDAO.mongodb.ticket.find(query, {})
        ri.succ(list)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.get('/customers/getDuplicateName', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var rs = await udeskDAO.mongodb.customer.getDuplicateName()
        ri.succ(rs)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/customers/:id/delete', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var rs = await udeskDAO.mongodb.customer.delete(id)
        if (rs && rs.result.ok == 1) {
            ri.succ(rs.result)
        }
        else {
            ri.error('删除失败')
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})
router.get('/agents', async function (ctx, next) {
    var ri = new ResultInfo()
    var query = {}
    try {
        var res = await udeskDAO.mongodb.agent.search(query)
        ri.succ(res)
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.get('/agents/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var query = { 'id': id }
        var rs = await udeskDAO.mongodb.agent.get(query)
        if (rs) {
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
})
router.get('/agents/detail/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    var id = parseInt(ctx.params.id)
    var query = { 'id': id }

    try {
        var res = await udeskDAO.mongodb.agent.search(query)
        if (res.length > 0) {
            ri.succ(res[0])
        }
        else {
            ri.error('没有数据')
        }

    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})
router.post('/agents/async', async function (ctx, next) {
    var ri = new ResultInfo()
    var pageNo = ctx.query.pageNo ? parseInt(ctx.query.pageNo) : 1
    var pageSize = ctx.query.pageSize ? parseInt(ctx.query.pageSize) : 20
    try {
        var res = await udeskDAO.webapi.agent.getAll(pageNo, pageSize)
        if (res.code == 1000) {
            var meta = res.meta
            var list = res.agents
            var result = []
            if (list.length > 0) {
                for (var i = 0, len = list.length; i < len; i++) {
                    var item = list[i]
                    var rs = await udeskDAO.mongodb.agent.update(item.id, item, true)
                    result.push(rs)
                }
                ri.succ({ meta: meta, result: result }, "同步成功")
            }
            else {
                ri.error('当前没有需要更新的数据')
            }
        }
        else {
            ri.err(res.message)
        }
    }
    catch (err) {
        ri.error(err)
    }
    ctx.response.body = ri;
})

router.post('/agents/:id/update', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var updateData = ctx.request.body
        var rs = await udeskDAO.mongodb.agent.update(id, updateData)
        if (rs.result.ok == 1) {
            ri.succ('', '更新成功')
        }
        else {
            ri.error('更新失败')
        }
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri;
})
module.exports = router