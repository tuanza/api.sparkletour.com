const dbs = require('../../configs/dbs/mssql')
const BaseDAO = require('../mssql/baseDAO')
let baseDao = new BaseDAO(dbs.cytserp)
var dao = {
    get: async function (pageNO, pageSize) {
        let sqlStr = `
        declare @pageNo int =@sp_pageNo
        declare @pageSize int =@sp_pageSize
        select top (@pageSize) * from
        (
            select distinct COUNT(1) OVER() AS total, ROW_NUMBER() over(order by t.flight_no) AS num,t.* from
            (
                select distinct flight_code as flight_no,air_line_code,air_line_name,dep_port_code,dep_port_name,arr_port_code,arr_port_name,dep_city_code,dep_city_name,arr_city_code,arr_city_name,Department_Time as dep_time,Arrival_Time as arr_time from [CYTSERP].[dbo].[Air_FlightInfo]
                where Air_Line_Name not like 'Unknown' and  Air_Line_Name not like ''	
            )  t
        ) t
        where t.num >(@pageNo-1)*(@pageSize)
        `
        let rs = { curPage: pageNO, total: 0, list: [] }
        let msReq = await baseDao.getReq()
        let result = await msReq
            .input('sp_pageNo', pageNO)
            .input('sp_pageSize', pageSize)
            .query(sqlStr)
        if (result.recordsets && result.recordsets.length > 0) {
            let dt = result.recordsets[0]
            rs.total = dt[0]["total"]
            dt.forEach(ele => {
                delete ele.total
                delete ele.num
            })
            rs.list = dt
        }
        return rs
    }
}
module.exports = dao