const Router = require('koa-router')
const router = new Router({
    prefix: '/contracts'
});
const ResultInfo = require('../common/ResultInfo')
const uploadDAO = {
    mongodb: require('../daos/mongodb/uploadDAO')
}
const udeskDAO = {
    mongodb: require('../daos/mongodb/udeskDAO')
}
const orderDAO = {
    mssql: require('../daos/mssql/orderDAO')
}
const enum_cur_field = require('../common/ticket-cus-fields')
const htmlHelper = require('../common/html-helper')
const http = require('http')
const fs = require('fs');
const pdf = require('html-pdf');
const moment = require('moment')
router.post('/:id/save', async function (ctx, next) {
    var ri = new ResultInfo()
    var id = ctx.params.id
    var url = 'http://127.0.0.1:3010/contracts/' + id
    try {
        var buffer = await getBufferByUrl(url)
        var rs = await uploadDAO.mongodb.upload(buffer, 'contract_' + id + '_' + new Date().getTime() + '.pdf')
        var _id = rs._id.toString()
        var fn = rs.filename
        rs = await udeskDAO.mongodb.ticket.update(parseInt(id), { 'contractUrl': '/upload/' + _id + '/' + fn })
        if (rs.result.ok == 1) {
            ri.succ('', '保存成功')
        }
        else {
            ri.error('保存失败')
        }

    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri;
})

router.post('/:id/init', async function (ctx, next) {
    var ri = new ResultInfo()
    try {
        var id = parseInt(ctx.params.id)
        var html = ctx.request.body.html
        var buffer = await htmlToBuffer(html)
        var rs = await uploadDAO.mongodb.upload(buffer, 'contract_' + id + '_' + new Date().getTime() + '.pdf')
        var _id = rs._id.toString()
        var fn = rs.filename
        rs = await udeskDAO.mongodb.ticket.update(parseInt(id), { 'contract_file': { 'id': _id, 'fileName': fn } })
        if (rs.result.ok == 1) {
            ri.succ({ id: _id, fileName: fn }, '保存成功')
        }
        else {
            ri.error('保存失败')
        }
    }
    catch (err) {
        ri.error(JSON.stringify(err))
    }
    ctx.response.body = ri;
})


router.get('/:id', async function (ctx, next) {
    var ri = new ResultInfo()
    var id = parseInt(ctx.params.id)
    var nt = ctx.query.nt || ''
    try {
        var item = await udeskDAO.mongodb.ticket.getTicketById({ 'ticket.id': id })
        if (!item) {
            ri.error('没有数据')
        }
        else {
            var ticket = item.ticket

            var orderNo = item.order && item.order.length > 0 ? item.order[0].订单编号 : ticket.custom_fields[enum_cur_field.OrderNo] || ''
            var typeId = item.contract_type_id ? parseInt(item.contract_type_id) : parseInt(ticket.custom_fields[enum_cur_field.ContractType] || 0)
            if (orderNo == '') {
                ri.error('缺少订单号')
            }
            else if (typeId == 0) {
                ri.error('缺少合同类型')
            }
            else {
                var order = item.order && item.order.length > 0 ? item.order[0] : ''
                var travellers = item.travellers || ''
                // if (order == '' || travellers == '') {
                //     var rs = await orderDAO.mssql.getDetailByOrderNo(orderNo)
                //     var ds = rs.recordsets
                //     order = ds.length > 0 && ds[0].length > 0 ? ds[0][0] : ''
                //     travellers = ds.length > 1 && ds[1].length > 0 ? ds[1] : ''
                // }
                if (order == '') {
                    ri.error('缺少订单信息')
                }
                else if (travellers == '') {
                    ri.error('缺少出行人信息')
                }
                else {
                    var contractTmp = await getTmp(typeId)
                    var total = order["应收金额"]
                    var paid = order["实收金额"]
                    var toPay = 0
                    if (paid > total) {
                        total = paid
                    }
                    var startDate = item.start_date ? moment(item.start_date).format('YYYY-MM-DD') : ticket.custom_fields[enum_cur_field.ServiceBeginDate] || ''
                    var endDate = item.end_date ? moment(item.end_date).format('YYYY-MM-DD') : ticket.custom_fields[enum_cur_field.ServiceEndDate] || ''
                    var payDateLimit = item.pay_limit ? moment(item.pay_limit).format('YYYY-MM-DD HH:mm:ss') : ticket.custom_fields[enum_cur_field.PayDateLimit] || ''
                    var startCity = item.dep_city ? item.dep_city : ticket.custom_fields[enum_cur_field.DepartureCity] || ''
                    var productName = item.product_name ? item.product_name : ticket.custom_fields[enum_cur_field.ProductName] || ''
                    var travellerAmount = travellers.length
                    var contractAttUrl = item.contract_atta_file ? "http://m.sparkletour.com/uploadfiles/" + item.contract_atta_file.id + "/" + item.contract_atta_file.fileName : ticket.custom_fields[enum_cur_field.ContractAttUrl] || ''
                    var is_deposit = item.is_deposit || false
                    var deposit = item.deposit ? item.deposit : ticket.custom_fields[enum_cur_field.Deposit] || ''
                    var depositPayDateLimit = item.deposit_limit ? moment(item.deposit_limit).format('YYYY-MM-DD HH:mm:ss') : ticket.custom_fields[enum_cur_field.DepositPayDateLimit] || ''
                    var groupNum = item.group_num ? item.group_num : ticket.custom_fields[enum_cur_field.GroupNum] || ''
                    var groupNo = order['团号'] || ''
                    if (contractAttUrl != "") {
                        var tmp = contractAttUrl.split('/')
                        tmp[tmp.Length - 1] = encodeURIComponent(tmp[tmp.Length - 1])
                        contractAttUrl = tmp.join("/")
                    }
                    var agent = await udeskDAO.mongodb.agent.get({ id: ticket.assignee_id })
                    var agentEmail = ""
                    var agentPhone = ""
                    if (agent) {
                        agentEmail = agent.email || ''
                        agentPhone = agent.cellphone || ''
                    }
                    var travellerTb = []

                    for (var i = 0; i < travellerAmount; i++) {
                        var traveller = travellers[i];
                        // travellerTb.push("<tr>")
                        // travellerTb.push("<td>" + traveller["出行人姓名"] + "</td>")
                        // travellerTb.push("<td>" + traveller["出行人姓氏"] + " " + traveller["出行人名称"] + "</td>")
                        // travellerTb.push("<td>" + traveller["性别"] + "</td>")
                        // travellerTb.push("<td>" + moment(traveller["生日"]).format('YYYY-MM-DD') + "</td>")
                        // travellerTb.push("<td>" + (traveller["出行人旅游证件类型"] || '') + "</td>")
                        // travellerTb.push("<td>" + (traveller["出行人旅游证件号"] || '') + "</td>")
                        // travellerTb.push("<td>" + (traveller["出行人有效期"] || '') + "</td>")
                        // travellerTb.push("</tr>")
                        travellerTb.push("<tr>")
                        travellerTb.push("<td>" + traveller["nick_name"] + "</td>")
                        travellerTb.push("<td>" + traveller["pin_yin_xing"] + " " + traveller["pin_yin_ming"] + "</td>")
                        travellerTb.push("<td>" + (traveller["gender"] == 1 ? '男' : '女') + "</td>")
                        travellerTb.push("<td>" + moment(traveller["birthday"]).format('YYYY-MM-DD') + "</td>")
                        travellerTb.push("<td>" + traveller["visa_type_txt"] + "</td>")
                        travellerTb.push("<td>" + traveller["visa_no"] + "</td>")
                        travellerTb.push("<td>" + traveller["expire_date"] + "</td>")
                        travellerTb.push("</tr>")
                    }
                    contractTmp = contractTmp
                        .replace("{订单编号}", orderNo)
                        .replace("{出行人信息}", travellerTb.join(''))
                        .replace("{出发日期}", moment(startDate).format('YYYY-MM-DD'))
                        .replace("{出发城市}", startCity)
                        .replace("{返回日期}", moment(endDate).format('YYYY-MM-DD'))
                        .replace("{线路名称}", productName)
                        .replace("{订单应收}", total)
                        .replace("{大写订单应收}", htmlHelper.moneyToChinese(total))
                        .replace("{联系人邮箱}", order["联系邮箱"])
                        .replace("{受理人邮箱}", agentEmail)
                        .replace("{联系人姓名}", order["联系人"])
                        .replace("{受理人姓名}", ticket.assignee_name)
                        .replace("{联系人电话}", order["联系电话"])
                        .replace("{受理人电话}", agentPhone)
                        .replace("{合同生成时间}", nt ? "" : "<span>合同生成时间：" + moment().format('YYYY-MM-DD HH:mm:ss') + "</span>")
                        .replace(/{支付时限}/g, moment(payDateLimit).format('YYYY-MM-DD HH:mm'))
                        .replace("{团号}", groupNo)
                        .replace("{成团人数}", groupNum)
                        .replace("{订金金额}", deposit)
                        .replace("{订金最晚支付时间}", depositPayDateLimit)
                        .replace("[支付时间1]", is_deposit ? 'none' : '')
                        .replace("[支付时间2]", is_deposit ? '' : 'none')
                    var contractAttHtml = contractAttUrl != "" ? "<a href=\"" + contractAttUrl + "\" target=\"_blank\">" + ([1, 2, 3, 4].indexOf(typeId) >= 0 ? "《预订单信息》" : "《旅游行程》") + "</a>、" : ""//自由行，单项：预订单信息，出境，境内，台湾：旅游行程
                    contractTmp = contractTmp.replace("{预订单信息URL}", contractAttHtml)
                    ri.succ(contractTmp)
                }
            }
        }
    }
    catch (err) {
        ri.error(err)
    }
    if (ri.code == 0) {
        ctx.response.body = ri.data
    }
    else {
        console.log(ri)
        ctx.response.body = ri
    }
})


function getTmp(typeId) {
    var fileName = "";
    switch (typeId) {
        case 1:
            fileName = "ziyouxing";
            break;
        case 2:
            fileName = "danxiangjipiao";
            break;
        case 3:
            fileName = "danxiangqianzheng";
            break;
        case 4:
            fileName = "danxiangjiudian";
            break;
        case 5:
            fileName = "chujing";
            break;
        case 6:
            fileName = "jingnei";
            break;
        case 7:
            fileName = "taiwan";
            break;
        default:
            fileName = "ziyouxing";
            break;
    }
    var tmpUrl = './template/' + fileName + '.html'
    return new Promise(function (resolve, reject) {
        fs.readFile(tmpUrl, function (err, data) {
            if (err) {
                reject(err)
            }
            else {
                resolve(data.toString())
            }
        })
    })
}

function getBufferByUrl(url) {
    return new Promise(function (resolve, reject) {
        try {
            http.get(url, function (res) {
                var html = ''
                res.on('data', function (d) {
                    html += d.toString()
                })
                res.on('end', function () {
                    var options = { format: 'Letter' }
                    pdf.create(html).toBuffer(function (err, buffer) {
                        resolve(buffer)
                    })
                })
            }).on('error', function (err) {
                reject(err)
            })
        }
        catch (err) {
            reject(err)
        }
    })
}

function htmlToBuffer(html) {
    return new Promise(function (resolve, reject) {
        try {
            var options = { format: 'Letter' }
            pdf.create(html).toBuffer(function (err, buffer) {
                resolve(buffer)
            })
        }
        catch (err) {
            reject(err)
        }
    })
}
module.exports = router