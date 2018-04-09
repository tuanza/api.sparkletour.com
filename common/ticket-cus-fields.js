module.exports = {
    OrderNo: "TextField_16178",
    GroupNo: "TextField_21884",//团号
    ProductName: "TextField_20145",
    ServiceBeginDate: "TextField_18842",
    ServiceEndDate: "TextField_18843",
    DepartureCity: "TextField_18844",
    ContractUrl: "TextField_19029",
    ContractAttUrl: "TextField_19295",
    DepartureDate: "TextField_19313",//预计出发日期
    PayDateLimit: "TextField_19952",
    TicketStatus: "SelectField_5189",
    ContractSubType: "SelectField_10010",
    ContractType: "SelectField_10157",
    Operator: "SelectField_9571",//后台跟单人
    Source: "SelectField_9685",//询价来源
    DestinationMarket: "SelectField_8403",//目的地市场
    TravellerAmount: "TextField_15644",//出行人数
    CancelReason: "SelectField_11014",//未成交原因
    CancelReasonExt: "TextField_21695",//未成交原因具体
    Deposit: "TextField_21885",//订金
    DepositPayDateLimit: "TextField_21891",//订金最晚支付时间
    GroupNum: "TextField_21887",//成团人数
    allCustomFields: [],
    init: function (data) {
        this.allCustomFields = data
    },
    getCusFieldTxt: function (fieldName) {
        var fields = this.allCustomFields.filter(function (item) {
            return item.field_name == fieldName
        });
        if (fields.length > 0) {
            var field = fields[0];
            return field.field_label
        }
        return ""
    },
    getCusFieldVal: function (fieldName, optKey) {
        var fields = this.allCustomFields.filter(function (item) {
            return item.field_name == fieldName
        });
        if (fields.length > 0) {
            var field = fields[0];
            if (["radio", "checkbox", "droplist"].indexOf(field.content_type) >= 0) {
                var vals = []
                for (var i = 0, len = field.options.length; i < len; i++) {
                    var opt = field.options[i]
                    if (opt[optKey] != undefined) {
                        vals.push(opt[optKey])
                    }
                }
                return vals.join(",")
            }
            else {
                return optKey || ''
            }
        }
        return ""
    }
}