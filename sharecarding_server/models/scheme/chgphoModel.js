/**
 * Created by Administrator on 2015/11/13.
 */
var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
/**
 * 换号记录表
 */
var chgphoScheMa = new Schema({
    uid: {
        type: Schema.Types.ObjectId,
        required: true
    },//会员id
    oldphone: {
        type: "String",
        required: true
    },//原手机号
    newphone: {
        type: "String",
        required: true
    },//新手机号
    chgtime: {
        type: Date,
        required: true,
        default: Date.now
    }//换号时间
});
module.exports = mongoose.model('chgpho', chgphoScheMa);