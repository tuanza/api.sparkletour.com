const cache = require('memory-cache')
const crypto = require('crypto');
const mongodb = require('mongodb')
const cacheKeys = require('../../configs/cache/keys')
const urlconfig = require('../../configs/webapi/udesk')
const dbs = require('../../configs/dbs/mongodb')
const webclient = require('../../common/webclient')
const MongoClient = mongodb.MongoClient
const UDeskAdminEmail = "yysx4@aoyou.com"
const UDeskAdminPass = "aoyou123"


var signUrl = async function () {
    var token = await open_api_token()
    var timestamp = new Date().getTime();
    var sign = crypto.createHash('sha1').update(UDeskAdminEmail + "&" + token + "&" + timestamp).digest('hex')
    return "email=" + UDeskAdminEmail + "&timestamp=" + timestamp + "&sign=" + sign
}

var open_api_token = async function () {
    var token = cache.get(cacheKeys.udesk.OPEN_API_TOKEN)
    if (token == null) {
        var postData = { email: UDeskAdminEmail, password: UDeskAdminPass }
        var res = await webclient.post(urlconfig.LOGIN, postData)
        if (res.code == 1000) {
            token = res.open_api_auth_token
            cache.put(cacheKeys.udesk.OPEN_API_TOKEN, token, 1000 * 60 * 60)
        }
    }
    return token
}

var dao = {
    ticket: {
        add: async function (ticket) {
            var data = {}
            var sign = await signUrl()
            var url = urlconfig.tickets + "?" + sign
            try {
                var t1 = new Date()
                var res = await webclient.post(url, { ticket: ticket })
                var t2 = new Date()
                var t = t2 - t1
                console.log('调用[' + url + ']用时：' + t)
                return res
            }
            catch (err) {
                return { "code": 0, "message": JSON.stringify(err) }
            }
        },
        getAll: async function (pageNo, pageSize, errCount) {
            var data = {}
            var sign = await signUrl()
            var url = urlconfig.tickets + "?page=" + pageNo + "&per_page=" + pageSize + "&" + sign
            errCount = errCount || 0
            try {
                var t1 = new Date()
                var res = await webclient.get(url)
                var t2 = new Date()
                var t = t2 - t1
                console.log('调用[' + url + ']用时：' + t)
                return res
            }
            catch (err) {
                if (errCount < 3) {
                    errCount++
                    await webclient.sleep(2000)
                    return await dao.ticket.getAll(pageNo, pageSize, errCount)
                }
                else {
                    return { "code": -1, "message": "获取数据失败,次数(" + errCount + ")" }
                }
            }
        },
        getByFilterId: async function (filterId, pageNo, pageSize, errCount) {
            var data = {}
            var sign = await signUrl()
            var url = urlconfig.tickets_in_filter + "?filter_id=" + filterId + "&page=" + pageNo + "&per_page=" + pageSize + "&" + sign
            errCount = errCount || 0
            try {
                var t1 = new Date()
                var res = await webclient.get(url)
                var t2 = new Date()
                var t = t2 - t1
                console.log('调用[' + url + ']用时：' + t)
                return res
            }
            catch (err) {
                if (errCount < 3) {
                    errCount++
                    await webclient.sleep(2000)
                    return await dao.ticket.getAll(pageNo, pageSize, errCount)
                }
                else {
                    return { "code": -1, "message": "获取数据失败,次数(" + errCount + ")" }
                }
            }
        },
        updateCusFields: async function (ticketId, cfs) {
            var data = { ticket: { custom_fields: cfs } }
            var sign = await signUrl()
            var url = urlconfig.tickets + "/" + ticketId + "?" + sign
            var res = await webclient.put(url, data)
            return res
        },
        getTicketById: async function (id) {
            var sign = await signUrl()
            var url = urlconfig.tickets_detail + "?" + sign + '&' + (id.indexOf('#') == 1 ? 'num=' : 'id=') + id
            var res = await webclient.get(url, {})
            return res
        },
        getAllCusFields: async function () {
            var sign = await signUrl()
            var url = urlconfig.tickets_custom_fields + "?" + sign
            var res = await webclient.get(url, {})
            return res
        }
    },
    customer: {
        add: async function (item) {
            var sign = await signUrl()
            var url = urlconfig.customers + "?" + sign
            var res = await webclient.post(url, item)
            return res
        },
        getAll: async function (pageNo, pageSize, errCount) {
            var data = {}
            var sign = await signUrl()
            var url = urlconfig.customers + "?page=" + pageNo + "&page_size=" + pageSize + "&" + sign
            errCount = errCount || 0
            try {
                var t1 = new Date()
                var res = await webclient.get(url)
                var t2 = new Date()
                console.log("调用" + url + '完成，耗时:' + (t2 - t1))
                return res
            }
            catch (err) {
                if (errCount < 3) {
                    errCount++
                    await webclient.sleep(2000)
                    return await dao.customer.getAll(pageNo, pageSize, errCount)
                }
                else {
                    return { "code": -1, "message": "获取数据失败,次数(" + errCount + ")" }
                }
            }
        },
        getByFilterId: async function (filterId, pageNo, pageSize, errCount) {
            var data = {}
            var sign = await signUrl()
            var url = urlconfig.customers + "?filter_id=" + filterId + "&page=" + pageNo + "&page_size=" + pageSize + "&" + sign
            errCount = errCount || 0
            try {
                var t1 = new Date()
                var res = await webclient.get(url)
                var t2 = new Date()
                console.log("调用" + url + '完成，耗时:' + (t2 - t1))
                return res
            }
            catch (err) {
                if (errCount < 3) {
                    errCount++
                    await webclient.sleep(2000)
                    return await dao.customer.getByFilterId(filterId, pageNo, pageSize, errCount)
                }
                else {
                    return { "code": -1, "message": "获取数据失败,次数(" + errCount + ")" }
                }
            }
        },
        getDetailById: async function (id) {
            var sign = await signUrl()
            var url = urlconfig.customers_get_customer + "?type=id&content=" + id + '&' + sign
            var res = await webclient.get(url)
            return res
        },
        getAllCusFields: async function () {
            var sign = await signUrl()
            var url = urlconfig.customers_custom_fields + "?" + sign
            var res = await webclient.get(url)
            return res
        },
        updateCusFields: async function (id, cfs) {
            var data = { custom_fields: cfs }
            var sign = await signUrl()
            var url = urlconfig.customers + "/update_customer?type=id&content=" + id + "&" + sign
            var res = await webclient.put(url, data)
            return res
        },
    },
    agent: {
        getAll: async function (pageNo, pageSize, errCount) {
            var data = {}
            var sign = await signUrl()
            var url = urlconfig.agents + "?page=" + pageNo + "&per_page=" + pageSize + "&" + sign
            errCount = errCount || 0
            try {
                var t1 = new Date()
                var res = await webclient.get(url)
                var t2 = new Date()
                var t = t2 - t1
                console.log('调用[' + url + ']用时：' + t)
                return res
            }
            catch (err) {
                if (errCount < 3) {
                    errCount++
                    await webclient.sleep(2000)
                    return await dao.ticket.getAll(pageNo, pageSize, errCount)
                }
                else {
                    return { "code": -1, "message": "获取数据失败,次数(" + errCount + ")" }
                }
            }
        }
    }
}

module.exports = dao
