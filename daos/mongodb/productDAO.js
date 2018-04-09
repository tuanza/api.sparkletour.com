const db = require('../../configs/dbs/mongodb')
const BaseDAO = require('../../daos/mongodb/BaseDAO')
let productDAO = new BaseDAO(db.baseUrl, db.dbName, db.collections.product)
const tools = require('../../daos/mongodb/common')

var dao = {
    add: async function (obj) {
        if (!obj.id) {
            obj.id = await tools.getNextSequenceValue(tools.sequenceNames.product_id)
        }
        try {
            var rs = await productDAO.add(obj)
            if (rs.result.ok == 1) {
                return obj.id
            }
            else {
                return 0
            }
        }
        catch (err) {
            throw err
        }
    },
    update: async function (query, obj, upsert) {
        try {
            var rs = await productDAO.update(query, obj, upsert)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    get: async function (query) {
        try {
            var rs = await productDAO.get(query)
            return rs
        }
        catch (err) {
            throw err
        }
    },
    search: async function (query, pageNo, pageSize) {
        try {
            var rs = await productDAO.find(query, {}, pageNo, pageSize)
            return rs
        }
        catch (err) {
            throw err
        }
    }
    // insertList: function (list) {
    //     return new Promise(function (resolve, reject) {
    //         MongoClient.connect(db.baseUrl, function (err, client) {
    //             if (err) {
    //                 reject(err)
    //             }
    //             else {
    //                 var collection = client.db(db.dbName).collection(db.collections.product)
    //                 collection
    //                     .deleteMany()
    //                     .then((res) => {
    //                         return collection.insertMany(list)
    //                     })
    //                     .then((res) => {
    //                         return collection.find({}).toArray()
    //                     }).then((res) => {
    //                         resolve(res)
    //                         client.close()
    //                     })
    //                     .catch(err => {
    //                         reject(err)
    //                         client.close()
    //                     }/* deal with errors in `err` */);
    //             }

    //         });
    //     })
    // },
    // search: function (query, pageNo, pageSize) {
    //     return new Promise(function (resolve, reject) {
    //         MongoClient.connect(db.baseUrl, function (err, client) {
    //             if (err) {
    //                 reject(err)
    //             }
    //             else {
    //                 var collection = client.db(db.dbName).collection(db.collections.product)
    //                 var rs = { totalPage: 0, list: [] }
    //                 collection
    //                     .find(query).count()
    //                     .then(res => {
    //                         rs.totalPage = Math.ceil(res * 1.0 / pageSize)
    //                         return collection.find(query).sort({ 'ProductId': -1 }).skip(pageSize * (pageNo - 1)).limit(pageSize).toArray()
    //                     })
    //                     .then((res) => {
    //                         rs.list = res
    //                         resolve(rs)
    //                         client.close()
    //                     })
    //                     .catch(err => {
    //                         reject(err)
    //                         client.close()
    //                     }/* deal with errors in `err` */);
    //             }

    //         });
    //     })
    // }

}

module.exports = dao