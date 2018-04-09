const dbs = require('../../configs/dbs/mssql')
const sql = require('mssql')
const cache = require('memory-cache')
const cacheKeys = require('../../configs/cache/keys')
const dbErp = new sql.ConnectionPool(dbs.cytserp)
const cfg = require('../../configs/config')
dbErp.connect()
var dao = {
    all: async function () {
//(t1.Input_Dept like '0113%' OR t1.Input_Dept like '0115%') and 
        let sqlStr = `
        declare @tb table 
        ( 
            ProductId int 
        ) 
        INSERT INTO @tb 
        select t1.Product_Id  from [CYTSAoyou].[dbo].[Aoyou_Search_ProductInfoList]  t1 with(nolock) 
        inner join CYTSERP.dbo.Product_Standard t2 with(nolock) on t1.Product_Id = t2.Product_Id  
        where t2.Product_Status =30 
         
        select Product_Id AS ProductId,ProductName,ProductSubName,ProductDays,ProductPrice,ISNULL(t1.ProductStartDate,'') AS  ProductStartDate,ISNULL(t1.ProductEndDate,'') AS ProductEndDate 
        ,ProductBeginCityID,ProductBeginCityName,ProductImageMurl,ProductImageSurl,Product_ImageUrl,AvailabilityDate from [CYTSAoyou].[dbo].[Aoyou_Search_ProductInfoList] t1 with(nolock) 
        inner join @tb t2 on t1.Product_Id=t2.ProductId 
         
        select t1.ProductID,t3.LabelID,t3.Name AS LabelName,t5.LabelID AS ParentID,'' AS ParentIDS from [CYTSAoyou].[dbo].[Label_Product_Rel] t1 with(nolock)--,t3.ParentIDS 
        inner join @tb t2 on t1.ProductID=t2.ProductId 
        inner join [CYTSAoyou].[dbo].[Label_Data] t3 with(nolock) on t1.[LabelGUID]=t3.[GUID] and t3.[IsUsing]=1 
        left join [CYTSAoyou].[dbo].[Label_Rel] t4 on t3.[GUID]=t4.[ChildGUID] 
        inner join [CYTSAoyou].[dbo].[Label_Data] t5 on t4.[ParentGUID]=t5.[GUID] 
        order by t1.ProductID 
        `
        try {
            var products = cache.get(cacheKeys.product.all)
            if (products == null) {
                var result = await dbErp.request().query(sqlStr)
                products = result.recordsets[0] || []
                var labels = result.recordsets[1] || []
                if (products.length > 0) {
                    for (var i = 0, len = products.length; i < len; i++) {
                        var product = products[i]
                        var tarLabels = labels.filter((item) => {
                            return item.ProductID == product.ProductId
                        })
                        product.Labels = tarLabels
                    }
                    cache.put(cacheKeys.product.all, products, 1000 * 60 * 60)
                }
            }
            return products
        } catch (err) {
            throw err
        }
    }
}

module.exports = dao