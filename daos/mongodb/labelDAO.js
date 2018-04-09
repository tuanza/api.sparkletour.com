const db = require('../../configs/dbs/mongodb')
const BaseDAO = require('../../daos/mongodb/BaseDAO')
let dao = new BaseDAO(db.baseUrl, db.dbName, db.collections.label)
const tools = require('../../daos/mongodb/common')
module.exports = {
    add: async function (obj) {
        try {
            if (!obj.id) {
                obj.id = await tools.getNextSequenceValue(tools.sequenceNames.label_id)
            }
            var rs = await dao.add(obj)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    addMany: async function (list) {
        try {
            var rs = await dao.addMany(list)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    update: async function (query, obj, upsert) {
        try {
            var rs = await dao.update(query, obj, upsert)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    get: async function (query, fields, rowCount) {
        try {
            fields = fields || {}
            if (rowCount) {
                let rs = await dao.find(query, fields, "", rowCount)
                return rs
            }
            else {
                let rs = await dao.find(query, fields)
                return rs
            }
            var rs = await dao.get(query)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    search: async function (query, pageNo, pageSize) {
        try {
            var rs = await dao.find(query, {}, pageNo, pageSize)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    getCurId: async function () {
        try {
            let id = await tools.getNextSequenceValue(tools.sequenceNames.label_id)
            return id
        }
        catch (err) {
            throw err
        }
    }

}