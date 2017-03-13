/**
 * Created by Administrator on 2015/11/17.
 */
/**
 * Created by Administrator on 2015/11/13.
 */
var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
/**
 * 短信发送记录表
 */
var msgrcdScheMa = new Schema({
    phone:{
        type: "String",
        required: true
    },//手机号
    keywords:{
        type: "String"
    },//关键字
    reason:{
        type: "String",
        enum: ['chgphone','register','findpwd'],
        required: true
    },//发送事由
    addtime: {
        type: Date,
        required: true,
        default: Date.now
    },//加入时间
    ip: {
        type: String,
        required: true
    },//来源ip
    result:{
        type: Boolean,
        required: true
    },//发送结果
    content:{
        type: String,
        required: true
    }//短信内容
});
module.exports = mongoose.model('msgrecord', msgrcdScheMa);