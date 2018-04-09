const db = require('../../configs/dbs/mongodb')
const BaseDAO = require('../../daos/mongodb/BaseDAO')
let flightDAO = new BaseDAO(db.baseUrl, db.dbName, db.collections.flight)
const tools = require('../../daos/mongodb/common')
var dao = {
    add: async function (obj) {
        try {
            var rs = await flightDAO.add(obj)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    addMany: async function (list) {
        try {
            var rs = await flightDAO.addMany(list)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    update: async function (query, obj, upsert) {
        try {
            var rs = await flightDAO.update(query, obj, upsert)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    get: async function (query) {
        try {
            var rs = await flightDAO.get(query)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    search: async function (query, pageNo, pageSize) {
        try {
            var rs = await flightDAO.find(query, {}, pageNo, pageSize)
            return rs
        }
        catch (err) {
            throw err
        }
    }

}
module.exports = dao