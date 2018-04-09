const dbconfig = require('../../configs/dbs/mongodb')
const MongoClient = require('mongodb').MongoClient;
const GridStore = require('mongodb').GridStore;
const ObjectID = require('mongodb').ObjectID;
const GridFSBucket = require('mongodb').GridFSBucket;
const tools = require('../../daos/mongodb/common')
var dao = {
    // upload: function (buffer, fileName) {
    //     return new Promise(function (resolve, reject) {
    //         MongoClient.connect(dbconfig.baseUrl, function (err, client) {
    //             var db = client.db(dbconfig.dbName);
    //             var gridStore = new GridStore(db, null, fileName, "w");
    //             gridStore.open(function (err, gridStore) {
    //                 gridStore.write(buffer, function (err, gridStore) {
    //                     gridStore.close(function (err, result) {
    //                         resolve(result)
    //                     })
    //                 })
    //             })
    //         })
    //     })
    // },
    // download: function (id) {
    //     return new Promise(function (resolve, reject) {
    //         MongoClient.connect(dbconfig.baseUrl, function (err, client) {
    //             var db = client.db(dbconfig.dbName);
    //             var fileId = new ObjectID(id);
    //             GridStore.read(db, fileId, function (err, data, res) {
    //                 if (err) {
    //                     reject(err)
    //                 }
    //                 else {
    //                     resolve(data)
    //                 }
    //             });
    //         })
    //     })
    // },
    upload: async function (buffer, fileName) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(dbconfig.baseUrl, function (err, client) {
                var db = client.db(dbconfig.dbName);
                var bucket = new GridFSBucket(db)
                var id = new ObjectID()
                var upstream = bucket.openUploadStreamWithId(id, fileName)
                //var res = upstream.write(buffer)
                upstream.end(buffer, function (err, result) {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(result)
                    }
                    client.close()
                })
            })
        })
    },
    download: function (id) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(dbconfig.baseUrl, function (err, client) {
                try {
                    var db = client.db(dbconfig.dbName);
                    var bucket = new GridFSBucket(db)
                    var fileId = new ObjectID(id)
                    var downloadstream = bucket.openDownloadStream(fileId)
                    var chunks = []
                    var size = 0
                    downloadstream.on('data', function (chunk) {
                        chunks.push(chunk);
                        size += chunk.length;
                    })
                    downloadstream.on("end", async function () {
                        var buffer = Buffer.concat(chunks, size);
                        resolve(buffer)
                        client.close()
                    })
                    downloadstream.on("error", function (err) {
                        reject(err)
                        client.close()
                    })
                }
                catch (err) {
                    reject(err)
                    client.close()
                }


            })
        })
    }
}
module.exports = dao