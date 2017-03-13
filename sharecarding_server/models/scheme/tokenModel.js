/**
 * Created by Administrator on 2015/11/30.
 */
var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
/**
 * token表
 */
var tokenScheMa = new Schema({
    token:{
        type: "String",
        required: true
    },//token码
    uid: {
        type: Schema.Types.ObjectId,
        required: true
    },//用户id
    uuid: {
        type: "String",
        required: true
    },//设备唯一id
    btime: {
        type: Date,
        required: true,
        default: Date.now
    },//生成时间
    avatime: {
        type: Date,
        required: true
    }//有效期
});
module.exports = mongoose.model('tokens', tokenScheMa);