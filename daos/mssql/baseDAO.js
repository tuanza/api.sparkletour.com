const dbs = require('../../configs/dbs/mssql')
const sql = require('mssql')

module.exports = function (config) {
    let pool = new sql.ConnectionPool(config)
    let connect = async function () {
        if (!pool.connected) {
            await pool.connect()
        }
    }
    this.query = async function (sqlStr, params) {
        try {
            await connect()
            let result = await pool.request().query(sqlStr)
            return result.recordsets || []
        }
        catch (err) {
            throw err
        }
    }
    this.getReq = async function () {
        try {
            await connect()
            return await pool.request()
        }
        catch (err) {
            throw err
        }
    }
}
