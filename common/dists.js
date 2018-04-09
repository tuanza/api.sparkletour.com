const dists = {
    0: [
        { txt: '北京', val: 1 },
        { txt: '天津市', val: 2 },
        { txt: '河北省', val: 3 },
        { txt: '山西省', val: 4 },
        { txt: '辽宁省', val: 5 },
        { txt: '吉林', val: 6 },
        { txt: '上海市', val: 7 },
        { txt: '江苏省', val: 8 },
        { txt: '浙江省', val: 9 },
        { txt: '安徽省', val: 10 },
        { txt: '福建省', val: 11 },
        { txt: '江西省', val: 12 },
        { txt: '山东省', val: 13 },
        { txt: '河南省', val: 14 },
        { txt: '内蒙古', val: 15 },
        { txt: '黑龙江省', val: 16 },
        { txt: '湖北省', val: 17 },
        { txt: '湖南省', val: 18 },
        { txt: '广东省', val: 19 },
        { txt: '广西', val: 20 },
        { txt: '海南省', val: 21 },
        { txt: '四川省', val: 22 },
        { txt: '贵州省', val: 23 },
        { txt: '云南省', val: 24 },
        { txt: '西藏', val: 25 },
        { txt: '陕西省', val: 26 },
        { txt: '甘肃省', val: 27 },
        { txt: '青海省', val: 28 },
        { txt: '宁夏', val: 29 },
        { txt: '新疆', val: 30 },
        { txt: '重庆市', val: 31 },
        { txt: '香港', val: 760 },
        { txt: '澳门', val: 761 },
        { txt: '台湾', val: 762 },
        { txt: '其他', val: 1266 }],//省份
    1: [
        { txt: '身份证', val: 1 },
        { txt: '护照', val: 2 },
        { txt: '军官证', val: 3 },
        { txt: '回乡证', val: 4 },
        { txt: '港澳通行证', val: 5 },
        { txt: '台胞证', val: 6 },
        { txt: '其他', val: 7 }],//身份证件类型
    2: [
        { txt: '身份证', val: 1 },
        { txt: '签证身份书', val: 4 },
        { txt: '因私护照', val: 5 },
        { txt: '因公护照', val: 6 },
        { txt: '外交护照', val: 7 },
        { txt: '港澳通行证', val: 8 },
        { txt: '台湾通行证', val: 9 },
        { txt: '其他', val: 10 }],//旅游证件类型
    3: [
        { txt: '合同', val: 1 },
        { txt: '合同附件', val: 2 }],//合同类型
    4: [
        { txt: '身份证正面', val: 1 },
        { txt: '身份证反面', val: 2 },
        { txt: '护照首页', val: 3 },
        { txt: '护照签证页', val: 4 },
        { txt: '户口本', val: 5 },
        { txt: '在职证明', val: 6 },
        { txt: '财产证明', val: 7 },
        { txt: '其它身份证件', val: 8 }],//上传证件类型
    5: [
        { txt: '潜力会员', val: 0 },
        { txt: '白金会员', val: 1 },
        { txt: '潜力紫金会员', val: 2 },
        { txt: '紫金会员', val: 3 }],//会员等级
    6: [
        { txt: '订单积分', val: 1 },
        { txt: '系统原因手工调整', val: 2 },
        { txt: '消费抵扣积分', val: 3 },
        { txt: '特殊活动赠送积分', val: 4 }],//积分类型
    7: [
        { val: "0", txt: "其它" },
        { val: "1", txt: "自由行" },
        { val: "2", txt: "单项机票合同" },
        { val: "3", txt: "单项签证合同" },
        { val: "4", txt: "单项酒店及其他目的地服务/度假套餐合同" },
        { val: "5", txt: "出境旅游合同" },
        { val: "6", txt: "境内旅游合同" },
        { val: "7", txt: "大陆居民赴台旅游合同" }],//旅游合同类型
    8: [
        { val: "1", txt: "私享游" },
        { val: "2", txt: "私享团" },
        { val: "3", txt: "度假套餐" }],//产品类型
    9: [
        { val: "1", txt: "机票" },
        { val: "2", txt: "酒店房型" },
        { val: "3", txt: "当地活动" }],//产品套餐类型
    10: [
        { val: "1", txt: "新建" },
        { val: "2", txt: "已支付" },
        { val: "0", txt: "已取消" }],//支付状态
    11: [
        { val: "1", txt: "普通卡" },
        { val: "2", txt: "白金卡" },
        { val: "3", txt: "紫金卡" }],//礼品卡种类
    12: [
        { val: "1", txt: "订单抵扣" },
        { val: "2", txt: "其他抵扣" }]//礼品卡使用类型
}

module.exports = {
    getAll: function () {
        return dists
    },
    getDictsByIds: function (ids) {
        var tar = {}
        for (var key in dists) {
            if (ids.indexOf(key) >= 0) {
                tar[key] = dists[key]
            }
        }
        return tar
    },
    getTxt: function (tid, val) {
        var tarDicts = dists[tid]
        var tars = tarDicts.filter(function (ele) {
            return ele.val == val
        })
        if (tars.length > 0) {
            return tars[0].txt
        }
        else {
            return ''
        }
    }
}