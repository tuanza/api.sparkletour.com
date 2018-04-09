const db = require('../../configs/dbs/mongodb')
var MongoClient = require('mongodb').MongoClient

var tools = {
    sequenceNames: {
        customer_point_type_id: 'customer_point_type_id',
        upload_id: 'upload_id',
        product_id: 'product_id',
        city_id: "city_id",
        label_id: "label_id",
        news_id: "news_id"
    },
    getNextSequenceValue: function (sequenceName) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(db.baseUrl, function (err, client) {
                if (err) {
                    reject(err)
                }
                else {
                    var collection = client.db(db.dbName).collection(db.collections.counters)
                    collection.count({ '_id': sequenceName }).then(res => {
                        if (res == 0) {
                            return collection.insertOne({ '_id': sequenceName, 'sequence_value': 2 })
                        }
                        else {
                            return collection.findOneAndUpdate({ '_id': sequenceName }, { $inc: { sequence_value: 1 } }, { upsert: true })
                        }
                    }).then(res => {
                        if (res.ok) {
                            resolve(res.value.sequence_value)
                        }
                        else if (res.result.ok) {
                            resolve(1)
                        }
                        client.close()
                    }).catch(err => {
                        reject(err)
                        client.close()
                    })
                }
            })
        })
    },
    setNextSequenceValue: function (sequenceName, val) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(db.baseUrl, function (err, client) {
                if (err) {
                    reject(err)
                }
                else {
                    var collection = client.db(db.dbName).collection(db.collections.counters)
                    collection.findOneAndUpdate({ '_id': sequenceName }, { $set: { sequence_value: val } }, { upsert: true }).then(res => {
                        resolve(res.result)
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

module.exports = tools