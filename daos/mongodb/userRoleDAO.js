const db = require('../../configs/dbs/mongodb')
var MongoClient = require('mongodb').MongoClient


var dao = {
    get: function (query) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(db.baseUrl, function (err, client) {
                if (err) {
                    reject(err)
                }
                else {
                    var collection = client.db(db.dbName).collection(db.collections.user_role)
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
                    var collection = client.db(db.dbName).collection(db.collections.user_role)
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
    update: function (id, item, upsert) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(db.baseUrl, function (err, client) {
                if (err) {
                    reject(err)
                }
                else {
                    item.updated_at = new Date()
                    var collection = client.db(db.dbName).collection(db.collections.user_role)
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

module.exports = dao