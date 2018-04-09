const MongoClient = require('mongodb').MongoClient
module.exports = function (dbUrl, dbName, colName) {
    let _dbUrl = dbUrl
    let _dbName = dbName
    let _colName = colName
    this.add = function (obj) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(_dbUrl, function (err, client) {
                if (err) {
                    reject(err)
                }
                else {
                    obj.created_at = new Date()
                    obj.updated_at = obj.created_at
                    var collection = client.db(_dbName).collection(_colName)
                    collection.insertOne(obj).then(res => {
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
    this.addMany = function (list) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(_dbUrl, function (err, client) {
                if (err) {
                    reject(err)
                }
                else {
                    list.forEach(obj => {
                        obj.created_at = obj.created_at || new Date()
                        obj.updated_at = obj.updated_at || obj.created_at
                    });
                    var collection = client.db(_dbName).collection(_colName)
                    collection.insertMany(list).then(res => {
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
    this.update = function (query, obj, upsert) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(_dbUrl, function (err, client) {
                if (err) {
                    reject(err)
                }
                else {
                    var collection = client.db(_dbName).collection(_colName)
                    let is_contain = false
                    for (let key in obj) {
                        if (key.indexOf('$') == 0) {
                            is_contain = true
                            break
                        }
                    }
                    if (!is_contain) {
                        obj.updated_at = new Date()
                    }
                    obj = is_contain ? obj : { $set: obj }
                    collection.update(query, obj, { upsert: upsert }).then(res => {
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
    this.get = function (query) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(_dbUrl, function (err, client) {
                if (err) {
                    reject(err)
                }
                else {
                    var collection = client.db(_dbName).collection(_colName)
                    collection.findOne(query).then(res => {
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
    this.find = function (query, fields, pageNo, pageSize, sortBy) {
        return new Promise(function (resolve, reject) {
            MongoClient.connect(_dbUrl, function (err, client) {
                if (err) {
                    reject(err)
                }
                else {
                    var collection = client.db(_dbName).collection(_colName)
                    if (pageNo == "" && pageSize > 0) {
                        if (sortBy) {
                            collection.find(query).sort(sortBy).project(fields).limit(pageSize).toArray()
                                .then((res) => {
                                    resolve(res)
                                    client.close()
                                })
                                .catch(err => {
                                    reject(err)
                                    client.close()
                                })
                        }
                        else {
                            collection.find(query).project(fields).limit(pageSize).toArray()
                                .then((res) => {
                                    resolve(res)
                                    client.close()
                                })
                                .catch(err => {
                                    reject(err)
                                    client.close()
                                })
                        }

                    }
                    else if (pageNo > 0 && pageSize > 0) {
                        let total = 0
                        collection.count(query).then((res) => {
                            total = res
                            if (sortBy) {
                                return collection.find(query).sort(sortBy).project(fields).skip(pageSize * (pageNo - 1)).limit(pageSize).toArray()
                            }
                            else {
                                return collection.find(query).project(fields).skip(pageSize * (pageNo - 1)).limit(pageSize).toArray()
                            }

                        }).then(res => {
                            resolve({ list: res, total: total })
                        }).catch(err => {
                            reject(err)
                            client.close()
                        })
                    }
                    else {
                        if (sortBy) {
                            collection.find(query).sort(sortBy).project(fields).toArray()
                                .then((res) => {
                                    resolve(res)
                                    client.close()
                                })
                                .catch(err => {
                                    reject(err)
                                    client.close()
                                })
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
                                })
                        }

                    }
                }
            });
        })
    }
}
