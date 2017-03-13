/**
 * Created by Administrator on 2015/11/13.
 */
var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
/**
 * 名片表
 */
var phonesScheMa = new Schema({
    phone:{
        type: "String",
        required: true
    },//手机号
    master:{
        type: "String",
        required: true
    },//机主姓名
    is_self: {
        type: Boolean,
        required: true,
        default: false
    },//是否可信
    sex: {
        type: "String",
        enum: ['男','女','保密'],
        default: '保密'
    },//性别
    nettype: {
        type: "String",
        enum: ['移动','联通','电信','未知'],
        default: '未知'
    },//网络类型
    addtime: {
        type: Date,
        required: true,
        default: Date.now
    },//加入时间
    edittime: {
        type: Date,
        required: true,
        default: Date.now
    },//修改时间
    avatar: {
        type: String,
        default: ""
    }//头像
});
module.exports = mongoose.model('phones', phonesScheMa);