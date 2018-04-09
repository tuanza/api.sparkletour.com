const db = require('../../configs/dbs/mongodb')
var MongoClient = require('mongodb').MongoClient
const tools = require('../../daos/mongodb/common')



var dao = {
    CUSTOMER_LEVEL: {
        0: '潜力会员',
        1: '白金会员',
        2: '潜力紫金会员',
        3: '紫金会员'
    },
    ticket: {
        insertList: function (list) {
            return new Promise(function (resolve, reject) {
                var idsToDel = []
                for (var i = 0, len = list.length; i < len; i++) {
                    idsToDel.push(list[i].ticket.id)
                }
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        var query = { "ticket.id": { "$in": idsToDel } }
                        collection
                            .deleteMany(query)
                            .then((res) => {
                                return collection.insertMany(list)
                            })
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        saveDetail: function (item) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        collection.update({ 'ticket.id': item.ticket.id }, { $set: item }, { upsert: true }).then(res => {
                            //var orderNo = item.ticket.custom_fields.TextField_16178 || ''
                            //dao.customer.addTicket(item.ticket.user_id, item.ticket.id, orderNo)
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })

            })
        },
        getTicketById: function (query) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        collection.findOne(query).then((res) => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        search: function (query, pageNo, pageSize) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        var rs = { list: [], total: 0, curPage: 0, totalPage: 0 }
                        collection
                            .find(query).count()
                            .then((res) => {
                                rs.total = res
                                rs.curPage = pageNo
                                rs.totalPage = Math.ceil(rs.total * 1.0 / pageSize)
                                return collection.find(query).sort({ 'ticket.updated_at': -1 }).skip(pageSize * (pageNo - 1)).limit(pageSize).toArray()
                            })
                            .then((res) => {
                                rs.list = res
                                resolve(rs)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }

                })
            })
        },
        save: function (item) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        collection
                            .updateOne({ "ticket.id": item.id }, { $set: item })
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        getCusFieldList: function (query) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket_cusfield)
                        query = query || {}
                        collection
                            .find(query).toArray()
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        getCusFieldByName: function (field_name) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket_cusfield)
                        query = { "field_name": field_name }
                        collection
                            .findOne(query)
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        saveCusFieldList: function (list) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket_cusfield)
                        var query = {}
                        collection
                            .deleteMany(query)
                            .then((res) => {
                                return collection.insertMany(list)
                            })
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        delTickets: function () {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        var query = { 'id': 41097994 }
                        collection
                            .deleteMany(query)
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            });
                    }
                });
            })
        },
        deleteOne: function (ticketId) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        collection
                            .deleteOne({ 'ticket.id': ticketId })
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            });
                    }
                });
            })
        },
        deleteMany: function (ticketIds) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        collection
                            .deleteMany({ 'ticket.id': { $in: ticketIds } })
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            });
                    }
                });
            })
        },
        getTicketsForCalc: function () {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        var date = new Date()
                        date = date.setDate(date.getDate() - 1)
                        date = new Date(date)
                        var query = {
                            'ticket.updated_at': { $gt: date },
                            'ticket.custom_fields.TextField_16178': { $ne: null, $exists: true, $type: 2, $regex: /^.{1,}$/ },
                            $or: [{ 'ext_info.is_calced': { $exists: false } }, { 'ext_info.is_calced': 0 }]
                        }
                        collection
                            .find(query).toArray()
                            .then((res) => {
                                client.close()
                                var list = []
                                for (var i = 0, len = res.length; i < len; i++) {
                                    list.push(res[i])
                                }
                                resolve(list)
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            });
                    }
                });
            })
        },
        saveTravellers: function (ticketId, travellers) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        var query = { 'ticket.id': ticketId }
                        collection
                            .findOneAndUpdate(query, { $set: { "travellers": travellers } }, { upsert: true })
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            });
                    }
                });
            })
        },
        update: function (ticketId, item) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        collection.update({ 'ticket.id': ticketId }, { $set: item }, { upsert: true }).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        removeField: function (ticketId, item) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        collection.update({ 'ticket.id': ticketId }, { $unset: item }, { multi: true }).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        find: function (query, fields, rowNum) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        fields = fields || {}
                        if (rowNum && rowNum > 0) {
                            collection.find(query).project(fields).limit(rowNum).toArray()
                                .then((res) => {
                                    resolve(res)
                                    client.close()
                                })
                                .catch(err => {
                                    reject(err)
                                    client.close()
                                });
                        }
                        else {
                            collection.find(query).project(fields).toArray()
                                .then((res) => {
                                    resolve(res)
                                    client.close()
                                })
                                .catch(err => {
                                    reject(err)
                                    client.close()
                                });
                        }
                    }
                });
            })
        }
    },
    customer: {
        find: function (query, fields, count) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        collection.find(query).project(fields).limit(count).toArray().then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        getDetailById: function (id) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        collection.findOne({ 'id': id }).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        del: function () {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        collection.deleteMany({}).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        saveDetail: function (item) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        collection.update({ 'id': item.id }, { $set: item }, { upsert: true }).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })

            })
        },
        saveMany: function (list) {
            return new Promise(function (resolve, reject) {
                var idsToDel = []
                for (var i = 0, len = list.length; i < len; i++) {
                    idsToDel.push(list[i].id)
                }
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                        client.close()
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        var query = { "id": { "$in": idsToDel } }
                        collection
                            .deleteMany(query)
                            .then((res) => {
                                return collection.insertMany(list)
                            })
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        search: function (query, pageNo, pageSize) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        var rs = { list: [], total: 0, curPage: 0, totalPage: 0 }

                        collection
                            .find(query).count()
                            .then((res) => {
                                rs.total = res
                                rs.curPage = pageNo
                                rs.totalPage = Math.ceil(rs.total * 1.0 / pageSize)
                                return collection.find(query).sort({ 'id': -1 }).skip(pageSize * (pageNo - 1)).limit(pageSize).toArray()
                            })
                            .then((res) => {
                                rs.list = res
                                resolve(rs)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            });
                    }
                });
            })
        },
        getIds: function () {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.ticket)
                        collection
                            .find({}).project({ 'ticket.user_id': 1, '_id': 0 }).toArray()
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        cusfieldSaveMany: function (list) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer_cusfield)
                        collection
                            .deleteMany({})
                            .then((res) => {
                                return collection.insertMany(list)
                            })
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        searchCusFields: function (query) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer_cusfield)
                        collection
                            .find(query).toArray()
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        addPointType: async function (typeName, pointValue, desc) {
            var id = await tools.getNextSequenceValue(tools.sequenceNames.customer_point_type_id)
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var item = { '_id': id, 'typeName': typeName, 'pointValue': pointValue, 'description': desc }
                        var collection = client.db(db.dbName).collection(db.collections.customer_point_type)
                        collection.findOneAndUpdate({ '_id': item._id }, { $set: item }, { upsert: true }).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        getPointType: function () {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer_point_type)
                        collection.find({}).toArray().then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        getPointTypeById: function (typeId) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer_point_type)
                        collection.findOne({ 'typeId': typeId }).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        addPoint: function (customerId, typeId, points, refNo, cost, desc) {
            var item = { typeId: typeId, points: points, refNo: refNo, cost: cost, desc: desc, create_at: new Date() }
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        collection
                            .findOne({ 'id': customerId })
                            .then(res => {
                                var curTotal = 0
                                var curCostTotal = 0
                                var curCostYear = 0
                                var isOverLimit = 0
                                if (res.ext_info == undefined) {
                                    res.ext_info = { pin_yin_xing: '', pin_yin_ming: '', gender: "", id_card_type: '', id_card_no: '', birth_place: '', birthday: '', visa_type: '', visa_no: '', issue_date: '', expire_date: '', issue_at: '', files: [], level: 0 }
                                }
                                if (res.pointLogs == undefined) {
                                    res.pointLogs = []
                                }
                                res.pointLogs.push(item)
                                var dateNow = new Date()
                                var dateYearAgo = dateNow.setFullYear(dateNow.getFullYear() - 1)
                                for (var i = 0; i < res.pointLogs.length; i++) {
                                    var pointLog = res.pointLogs[i]
                                    curTotal += pointLog.points
                                    curCostTotal += pointLog.cost
                                    if (pointLog.cost > 150000) {
                                        isOverLimit = 1
                                    }
                                    if (Date.parse(item.create_at) >= dateYearAgo) {
                                        curCostYear += pointLog.cost
                                    }

                                }
                                if (curCostTotal > 500000 || curCostYear > 300000) {
                                    res.ext_info.level = 3
                                }
                                else if (curCostTotal > 300000 || isOverLimit) {
                                    res.ext_info.level = 2
                                }
                                else if (res.tickets && res.tickets.length > 0) {
                                    res.ext_info.level = 1
                                }
                                res.points = curTotal
                                return collection.updateOne({ 'id': customerId }, { $set: res })
                            })
                            .then(res => {
                                if (res.result.ok == 1) {
                                    res.result.added = item
                                }
                                resolve(res)
                                client.close()
                            }).catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        calcPoints: function (ids) {

        },
        addTicket: function (cid, tid, orderNo) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        collection
                            .findOne({ 'id': cid })
                            .then(res => {
                                if (res) {
                                    res.tickets = res.tickets || []
                                    if (res.ext_info == undefined) {
                                        res.ext_info = { pin_yin_xing: '', pin_yin_ming: '', gender: "", id_card_type: '', id_card_no: '', birth_place: '', birthday: '', visa_type: '', visa_no: '', issue_date: '', expire_date: '', issue_at: '', files: [], level: 0 }
                                    }
                                    if (res.ext_info.level == 0 && orderNo.length > 0) {
                                        res.ext_info.level = 1
                                    }
                                    let isAdded = 0
                                    for (var i = 0, len = res.tickets.length; i < len; i++) {
                                        if (res.tickets[i] == tid) {
                                            isAdded = 1
                                        }
                                    }
                                    if (!isAdded) {
                                        res.tickets.push(tid)
                                    }
                                    return collection.findOneAndUpdate({ 'id': cid }, { $set: res })
                                }
                                else {
                                    resolve(res)
                                    client.close()
                                }
                            })
                            .then(res => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        saveExtInfo: function (customerId, extInfo) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        collection.update({ 'id': customerId }, { $set: { 'ext_info': extInfo } }).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        update: function (id, item) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        collection.update({ 'id': id }, { $set: item }, { upsert: true }).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        getDuplicateName: function () {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        collection.aggregate([
                            { $group: { _id: "$nick_name", count: { $sum: 1 } } },
                            { $match: { count: { $gt: 1 } } }
                        ]).toArray().then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        delete: function (id) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.customer)
                        collection.deleteOne({ 'id': id }).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        }
    },
    agent: {
        saveMany: function (list) {
            return new Promise(function (resolve, reject) {
                var idsToDel = []
                for (var i = 0, len = list.length; i < len; i++) {
                    idsToDel.push(list[i].id)
                }
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.agent)
                        var query = { "id": { "$in": idsToDel } }
                        collection
                            .deleteMany(query)
                            .then((res) => {
                                return collection.insertMany(list)
                            })
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            })
                    }
                })
            })
        },
        search: function (query) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.agent)
                        collection
                            .find(query).toArray()
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            });
                    }
                });
            })
        },
        get: function (query) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.agent)
                        collection
                            .findOne(query)
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            });
                    }
                });
            })
        },
        find: function (query, fields, rowNum) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        var collection = client.db(db.dbName).collection(db.collections.agent)
                        collection.find(query).project(fields).limit(rowNum).toArray()
                            .then((res) => {
                                resolve(res)
                                client.close()
                            })
                            .catch(err => {
                                reject(err)
                                client.close()
                            });
                    }
                });
            })
        },
        add: function (item) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        item.updated_at = new Date()
                        var collection = client.db(db.dbName).collection(db.collections.agent)
                        collection.insert(item).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        },
        update: function (id, item, upsert) {
            return new Promise(function (resolve, reject) {
                MongoClient.connect(db.baseUrl, function (err, client) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        item.updated_at = new Date()
                        var collection = client.db(db.dbName).collection(db.collections.agent)
                        collection.update({ 'id': id }, { $set: item }, { upsert: upsert }).then(res => {
                            resolve(res)
                            client.close()
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                })
            })
        }
    }
}

module.exports = dao