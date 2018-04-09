const dbs = require('../../configs/dbs/mssql')
const BaseDAO = require('../mssql/baseDAO')
let baseDao = new BaseDAO(dbs.cytserp)
var dao = {
    cityDAO: {
        getAllCities: async function () {
            let sqlStr = `
            select t.CityID,ISNULL(t2.CityName,'') AS CityName,lower(t3.CityName) AS CityNameEng ,lower(ISNULL(t2.Help_Code,'')) AS HelpCode from Geo_City t
            left join Geo_City_Text t2 on t.CityID=t2.CityID and t2.LangID=142
            left join Geo_City_Text t3 on t.CityID=t3.CityID and t3.LangID=0
            `
            return await baseDao.query(sqlStr)
        }
    }
}
module.exports = dao