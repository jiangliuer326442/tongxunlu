var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
/**
 * 会员表
 */
var usersScheMa = new Schema({
    getui_id: {
        type: "String"
    },//个推用户id
    photo: {
        type: "String"
    },//头像
    phone: {
        type: "String",
        required: true
    },//手机号
    pwd: {
        type: "String",
        required: true
    },//登录密码
    realname: {
        type: "String",
        required: true
    },//真实姓名
    rtime: {
        type: Date,
        required: true,
        default: Date.now
    },//注册时间
    rip: {
        type: "String",
        required: true
    },//注册IP
    ltime: {
        type: Date,
        required: true,
        default: Date.now
    },//登录时间
    lip: {
        type: "String",
        required: true
    },//登录IP
    ltimes: {
        type: Number,
        required: true,
        default: 1
    },//登录次数
    lng: Number,//经度
    lat: Number,//纬度
    province: {
        type: "String"
    },//省份
    city: {
        type: "String"
    },//城市
    area: {
        type: "String"
    },//地区
    address: String//地址
});
module.exports = mongoose.model('users', usersScheMa);