/**
 * Created by Administrator on 2015/11/22.
 */
var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
/**
 * 联系人表
 */
var contactsScheMa = new Schema({
    uid: {
        type: Schema.Types.ObjectId,
        required: true
    },//会员id
    cphone: {
        type: "String",
        required: true
    },//联系人号码
    cname: {
        type: "String",
        required: true
    },//联系人备注
    cuid: {
        type: Schema.Types.ObjectId
    }//联系人会员id
});
module.exports = mongoose.model('contacts', contactsScheMa);