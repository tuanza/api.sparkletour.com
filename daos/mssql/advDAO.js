const dbs = require('../../configs/dbs/mssql')
const sql = require('mssql')
const pool = new sql.ConnectionPool(dbs.spdb)
var dao = {
    getAll: async function () {
        let sqlStr = `
        SELECT
             [ChannelId] channel_id
            ,[ChannelName] channel_name
            ,[AreaId] area_id
            ,[AreaName] area_name
            ,[AreaTitle] area_title
            ,[IsValid] is_valid
        FROM [SparkleTourDB].[dbo].[SparkleTour_Advertise_Channel]

        SELECT
             [AreaId] area_id
            ,[Title] title
            ,[ImgList] images
            ,[Link] link
            ,[Content] contents
            ,[IsValid] is_valid
            ,[SortNo] sort_no
        FROM [SparkleTourDB].[dbo].[SparkleTour_Advertise_Detail]
        `
        await connect()
        var result = await pool.request().query(sqlStr)
        return result.recordsets || []
    }
}

async function connect() {
    if (!pool.connected) {
        await pool.connect()
    }
}
module.exports = dao