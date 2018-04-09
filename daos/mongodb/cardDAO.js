const db = require('../../configs/dbs/mongodb')
const BaseDAO = require('./BaseDAO')
var baseDAO = new BaseDAO(db.baseUrl, db.dbName, db.collections.card)
var dao = {
    add: async function (obj) {
        try {
            var rs = await baseDAO.add(obj)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    addMany: async function (list) {
        try {
            var rs = await baseDAO.addMany(list)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    update: async function (query, obj, upsert) {
        try {
            var rs = await baseDAO.update(query, obj, upsert)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    get: async function (query) {
        try {
            var rs = await baseDAO.get(query)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    find: async function (query, pageNo, pageSize) {
        try {
            var rs = await baseDAO.find(query, {}, pageNo, pageSize)
            return rs
        }
        catch (err) {
            throw err
        }
    }

}

module.exports = dao