var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
/**
 * 名片表
 */
var cardScheMa = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true
    },//会员id
    company: {
        type: "String",
        required: true
    },//公司名称
    e_company: {
        type: "String"
    },//公司英文名称
    clogo: String,//公司LOGO
    position: {
        type: "String",
        required: true
    },//职位
    ctel: {
        type: "String"
    },//服务热线
    cqq: {
        type: "String"
    },//QQ号码
    cslogan: String,//公司口号
    caddress: {
        type: "String"
    },//公司地址
    cfax: String,//公司传真
    cemail: String,//公司邮箱
    cweb: String,//公司网址
    cbusiness: {
        type: "String"
    }//经营业务
});
module.exports = mongoose.model('cards', cardScheMa);