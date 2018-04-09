const dbs = require('../../configs/dbs/mssql')
const sql = require('mssql')
const cache = require('memory-cache')
const cacheKeys = require('../../configs/cache/keys')
const dbErp = new sql.ConnectionPool(dbs.cytserp)
dbErp.connect()
var dao = {
    getDetailByOrderNo: async function (orderNo) {
        let sqlStr = `
        DECLARE @OrderNo nvarchar(20)=@sp_OrderNo
        DECLARE  @OrderId int
        select @OrderId=Main_Order_ID from [CYTSERP].[dbo].Main_Order where Main_Order_NO=@OrderNo
        SELECT t2.Main_Order_ID 订单Id,t2.Main_Order_No 订单编号,
        t1.Contactor  联系人,case when t1.Contact is not null and t1.Contact <> '' then t1.Contact else t1.ContactCarbon end 联系电话 ,
        case when t1.Contact_EMail is not null and t1.Contact_EMail<>'' then  t1.Contact_EMail else t1.AutoConfirm end 联系邮箱 , 
        t2.Group_NO 团号,t2.Group_Name 团队名称,t2.Start_Date 出发日期,t2.End_Date 返回日期,t2.Status 订单状态Id,t6.DictValue 订单状态,
        t2.Total_Receivable 应收金额,t2.total_actual 实收金额,
        t2.Group_ID 团队id,t2.Product_Dept_NO 产品部门编号,t2.Product_ID 产品id,ISNULL(t2.Product_NO,'') 产品编号,t2.Sub_Order_ID 子订单id,t2.Sub_Order_NO 子订单编号,
		t1.Customer_ID 客户id,ISNULL(t1.Customer_Name,'') 客户姓名,t1.Customer_Type 客户类型,
		t1.Input_User 制单人id,t1.Input_Dept 制单部门id
        FROM [CYTSERP].[dbo].[Main_Order] t1 with(nolock)
		LEFT JOIN [CYTSERP].[dbo].[Sub_Order] t2 with(nolock) ON t2.Main_Order_ID=t1.Main_Order_ID
        LEFT JOIN sysbase.dbo.SC1009 t6 with(nolock) on t6.Taxis=t2.Status
        WHERE t2.Main_Order_ID=@OrderId

        select	gci.Name 出行人姓名
                    ,gci.FirstName 出行人姓氏
                    ,gci.LastName 出行人名称
                    ,case gci.Sex when 1 then '男' when 2 then '女' end 性别
                    ,gci.BirthDay 生日
                    ,case gci.IDCardType when 2 then gci.IDNo when 1 then gci.IDNo  else gci.Passport_id end 出行人旅游证件号
                    ,case gci.IDCardType when 2 then '因私护照' when 1 then '身份证' else cm13.DictValue end 出行人旅游证件类型
                    ,gct2.ProvinceName 出行人签发地
                    ,gci.Issue_date  出行人签发日期
                    ,gci.Valid_date 出行人有效期
                    ,gci.IDCardType 证件类型
                    ,gci.IDNo 证件号码
                from cytserp.dbo.Group_CUSTOMER_INFO AS gci  with(nolock)
            left join Sysbase.dbo.CM1003 cm13 WITH(nolock) on(gci.Passport_type_id=cm13.DictKey collate database_default)
            left join Sysbase.dbo.Geo_Province_Text gct2 WITH(nolock) on(gci.Issue_city=gct2.ProvinceID and gct2.LangID=142)
            where 
            gci.Main_Order_ID=@OrderId
        `
        var result = await dbErp.request().input('sp_OrderNo', sql.NVarChar, orderNo).query(sqlStr)
        if (result.recordsets && result.recordsets.length > 0) {
            return result.recordsets
        }
        else {
            return ''
        }
    },
    getSimpleByOrderNo: async function (orderNo) {
        let sqlStr = `
        DECLARE @OrderNo nvarchar(20)=@sp_OrderNo
        DECLARE  @OrderId int
        select @OrderId=Main_Order_ID from [CYTSERP].[dbo].Main_Order where Main_Order_NO=@OrderNo
        SELECT t2.Main_Order_ID 订单Id,t2.Main_Order_No 订单编号,
        t1.Contactor  联系人,case when t1.Contact is not null and t1.Contact <> '' then t1.Contact else t1.ContactCarbon end 联系电话 ,
        case when t1.Contact_EMail is not null and t1.Contact_EMail<>'' then  t1.Contact_EMail else t1.AutoConfirm end 联系邮箱 , 
        t2.Group_NO 团号,t2.Group_Name 团队名称,t2.Start_Date 出发日期,t2.End_Date 返回日期,t2.Status 订单状态Id,t6.DictValue 订单状态,
        t2.Total_Receivable 应收金额,t2.total_actual 实收金额,
        t2.Group_ID 团队id,t2.Product_Dept_NO 产品部门编号,t2.Product_ID 产品id,ISNULL(t2.Product_NO,'') 产品编号,t2.Sub_Order_ID 子订单id,t2.Sub_Order_NO 子订单编号,
		t1.Customer_ID 客户id,ISNULL(t1.Customer_Name,'') 客户姓名,t1.Customer_Type 客户类型,
		t1.Input_User 制单人id,t1.Input_Dept 制单部门id
        FROM [CYTSERP].[dbo].[Main_Order] t1 with(nolock)
		LEFT JOIN [CYTSERP].[dbo].[Sub_Order] t2 with(nolock) ON t2.Main_Order_ID=t1.Main_Order_ID
        LEFT JOIN sysbase.dbo.SC1009 t6 with(nolock) on t6.Taxis=t2.Status
        WHERE t2.Main_Order_ID=@OrderId
        `
        var result = await dbErp.request().input('sp_OrderNo', sql.NVarChar, orderNo).query(sqlStr)
        if (result.recordsets && result.recordsets.length > 0) {
            return result.recordsets[0]
        }
        else {
            return ''
        }
    },
    getOrdersByYear: async function (year) {
        let sqlStr = `
            select                                                                                            
            so.Main_Order_NO 订单号                                                                   
            ,g.group_no 团号                                                                          
            ,SUBSTRING(g.group_no,1,4) 团号年                                                         
            ,SUBSTRING(g.group_no,1,6) 团号月                                                         
            ,case when so.Status=1 then '新建'                                                        
            when so.Status=30 then '完成'                                                         
            when so.Status=19 then '取消'                                                         
            when so.Status=5 then '排队'                                                          
            end as 订单状态                                                                           
            ,Replace(replace(replace(so.group_name,char(10), ''),char(13),'') ,CHAR(9),'')  订单名称  
            ,CONVERT(varchar(10),so.Start_Date,120) 出发时间                                          
            ,CONVERT(varchar(10),so.End_Date,120) 返回时间                                            
            ,CONVERT(varchar(10),so.Input_Date,120) 下单时间                                          
            ,CONVERT(varchar(10),so.Submit_Date,120) 提交时间                                         
            ,dp.DepartmentName 开团部门                                                               
            ,au.UserName 开团人                                                                       
            ,dp2.DepartmentName 制单部门                                                              
            ,au2.UserName 制单人                                                                      
            ,dp4.DepartmentName 发单部门                                                              
            ,au4.UserName 发单人                                                                      
            ,so.Total_Receivable 订单应收                                                             
            ,so.Total_Actual 订单实收                                                                 
            ,so.Finance_Confirm_Fee 财务确认金额                                                      
            ,so.Total_Deduction 订单总优惠                                                            
            ,so.Order_Num 订单人数	                                                                  
            ,so.Arrearage_Total 欠款审批金额                                                          
            ,so.total_receivable-so.finance_confirm_fee 欠款金额                                      
            ,od.dictvalue 订单来源                                                                    
            ,case when od29.DictValue='招商银行信用卡中心' then '耀悦渠道' else od29.DictValue end 订单子来源                                                          
            ,Replace(replace(replace(so.Remark,char(10), ''),char(13),'') ,CHAR(9),'') 订单备注       
            ,case when so.subattribute=1 then '国内'                                                  
            when so.subattribute=2 then '国际'                                                    
            else '其他'                                                                           
            end as [国内/国际]                                                                        
            ,gct.cityname 出发城市                                                                    
            ,Replace(replace(replace(mo.Contactor,char(10), ''),char(13),'') ,CHAR(9),'') 订单联系人  
            ,Replace(replace(replace(mo.Contact,char(10), ''),char(13),'') ,CHAR(9),'') 订单联系方式  
            ,mo.customer_id                                                                           
            from sub_order so  with(nolock)                                                                   
            left join main_order mo with(nolock) on(so.Main_Order_ID=mo.Main_Order_ID)                        
            left join groups g with(nolock) on(so.group_id=g.group_id)                                        
            left join sysbase.dbo.COM_Department dp with(nolock) on(g.Input_Dept=dp.DepartmentCode)           
            left join sysbase.dbo.Aut_User au with(nolock) on(g.Input_User=au.UserID)                         
            left join sysbase.dbo.COM_Department dp2 with(nolock) on(so.Input_Dept=dp2.DepartmentCode)        
            left join sysbase.dbo.Aut_User au2 with(nolock) on(so.Input_User=au2.UserID)                      
            left join sysbase.dbo.OD1028 od with(nolock) on(so.source_type=od.dictkey)                        
            left join sysbase.dbo.OD1029 od29 with(nolock) on(so.Source_Sub_Type=od29.dictkey)                
            left join sysbase.dbo.COM_Department dp4 with(nolock) on(so.Ori_Input_Dept=dp4.DepartmentCode)    
            left join sysbase.dbo.Aut_User au4 with(nolock) on(so.Ori_Input_User=au4.UserID)                  
            left join sysbase.dbo.Geo_City_Text gct with(nolock) on(g.Begin_City_Id=gct.CityID and langid=142)
            where                                                                                             
            (so.Status =1 or so.Status=30)                                                                   
            and so.Input_Dept like '0115%'                                                            
            and substring(so.group_no,1,4) like @year                                                 
            order by 团号年,团号月 
        `
        var result = await dbErp.request().input('year', sql.Int, year).query(sqlStr)
        if (result.recordsets && result.recordsets.length > 0) {
            return result.recordsets[0]
        }
        else {
            return ''
        }
    },
    getGroupMoneyByYear: async function (year) {
        let sqlStr = `
            select 
            g.Group_Id 团队ID
            ,g.Group_No 团号
            ,case g.Group_Type_id when 1 then '预制团队' when 2 then '定制团队' when 3 then '单项产品'  when 4 then '自由行产品' when 5 then '邮轮产品'
            end as 团队类型
            ,SUBSTRING(g.group_no,1,6) 团号月
            ,	Replace(replace(replace(g.group_name,char(10), ''),char(13),'') ,CHAR(9),'')  团队名称
            ,g.Duration 团队天数
            ,g.Used_Pax 报名人数
            ,g.Guide_Count 领队占位人数
            ,convert(varchar(6),d.Posting_Date,112) 结算年月
            ,case when g.SETTLEMENT_STATUS=1 then '新建'  when g.SETTLEMENT_STATUS=30 then '完成' 
                else '未生成' end as 团队结算状态
            ,a.EstRevenue_RMB 计划收入
            ,a.Adjust_EstRevenue_RMB 调整收入
            ,a.EstRevenue_RMB-a.Total_Deduction+a.Adjust_EstRevenue_RMB 调整后计划收入
            ,a.Revenue_rmb 实际收入
            ,a.EstRevenue_RMB-a.Revenue_rmb-a.Total_Deduction 欠款
            ,a.EstCost_RMB 计划人民币成本
            ,a.Adjust_EstCost_RMB 调整人民币成本
            ,a.EstCost_RMB+a.Adjust_EstCost_RMB   调整后计划人民币成本
            ,a.Cost_RMB 实际人民币成本
            ,a.EstRevenue_RMB-a.EstCost_RMB-a.Adjust_EstCost_RMB-a.Total_Deduction  计划毛利额
            ,a.EstRevenue_RMB-a.Total_Deduction+a.Adjust_EstRevenue_RMB-(a.EstCost_RMB+a.Adjust_EstCost_RMB ) 调整后计划毛利额
            ,a.Revenue_RMB-a.Cost_RMB 实际毛利额
            ,a.Total_Deduction 优惠
            ,case when a.EstRevenue_RMB=0 then 0 else (a.EstRevenue_RMB-a.EstCost_RMB+a.Adjust_EstCost_RMB-a.Total_Deduction)/(a.EstRevenue_RMB-a.Total_Deduction) end as 计划毛利率
            ,case when a.Revenue_rmb=0 then 0 else (a.Revenue_rmb-a.Cost_RMB-a.Total_Deduction)/ a.Revenue_rmb  end as 实际毛利率
            ,dp.DepartmentName 开团部门
            ,au.UserName 开团人
            ,convert(varchar(10),g.Departure_Date,120) 发团日期
            ,convert(varchar(10),g.Return_Date,120) 返回日期
        from BC_Assistant_Ledger A with(nolock)
        left join groups g with(nolock) on(a.Operation_Bill_Id=g.Group_Id)
        left join BC_Estimated_Detail C with(nolock) on(a.Operation_Bill_Id=c.Operation_Bill_Id)
        left join BC_EstimatedRC D with(nolock) on(c.ERC_Id=d.ERC_Id)
        left join sysbase.dbo.COM_Department dp with(nolock) on(dp.DepartmentCode=g.Input_Dept)
        left join sysbase.dbo.Aut_User au with(nolock) on(au.UserID=g.Input_User)
        where (g.Input_Dept like '0113%' OR g.Input_Dept like '0115%') And substring(g.group_no,1,4) like @year
        `
        var result = await dbErp.request().input('year', sql.VarChar(4), year).query(sqlStr)
        if (result.recordsets && result.recordsets.length > 0) {
            return result.recordsets[0]
        }
        else {
            return ''
        }
    },
    getOrdersAfterDate: async function (date) {
        var sqlStr = `
            select 
                CONVERT(varchar(10),so.Input_Date,120) as date, count(so.Main_Order_ID) as count 
                from sub_order so  with(nolock)   
            where 
                so.Status in (1,30)                                                                   
                and so.Input_Dept like '0115%'                                                            
                and so.Input_Date >= @date
	            and so.Input_Date <CONVERT(varchar(10),GETDATE(),120)
            group by
                CONVERT(varchar(10),so.Input_Date,120) 
        `
        var result = await dbErp.request().input('date', sql.NVarChar, date).query(sqlStr)
        if (result.recordsets && result.recordsets.length > 0) {
            return result.recordsets[0]
        }
        else {
            return ''
        }
    }
}

module.exports = dao