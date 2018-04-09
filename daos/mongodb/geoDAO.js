const db = require('../../configs/dbs/mongodb')
const BaseDAO = require('../../daos/mongodb/BaseDAO')
let cityDAO = new BaseDAO(db.baseUrl, db.dbName, db.collections.geo_city)
const tools = require('../../daos/mongodb/common')
var dao = {
    cityDAO: {
        add: async function (obj) {
            if (obj.id == 0) {
                obj.id = await tools.getNextSequenceValue(tools.sequenceNames.product_id)
            }
            try {
                var rs = await cityDAO.add(obj)
                return rs
            }
            catch (err) {
                throw err
            }
        },
        addMany: async function (list) {
            try {
                var rs = await cityDAO.addMany(list)
                return rs
            }
            catch (err) {
                throw err
            }
        },
        update: async function (query, obj, upsert) {
            try {
                var rs = await cityDAO.update(query, obj, upsert)
                return rs
            }
            catch (err) {
                throw err
            }
        },
        get: async function (query) {
            try {
                var rs = await cityDAO.get(query)
                return rs
            }
            catch (err) {
                throw err
            }
        },
        search: async function (query, pageNo, pageSize) {
            try {
                var rs = await cityDAO.find(query, {}, pageNo, pageSize)
                return rs
            }
            catch (err) {
                throw err
            }
        }
    }

}
module.exports = dao