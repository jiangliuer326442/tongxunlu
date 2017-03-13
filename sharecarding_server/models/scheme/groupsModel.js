/**
 * Created by Administrator on 2015/11/22.
 */
var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
/**
 * 群组表
 */
var groupsScheMa = new Schema({
    lord: {
        type: Schema.Types.ObjectId,
        required: true
    },//群主id
    name: {
        type: "String",
        required: true
    },//群组名称
    number: {
        type: "String",
        required: true
    },//群号码
    addtime: {
        type: Date,
        required: true,
        default: Date.now
    }//建群时间
});
module.exports = mongoose.model('groups', groupsScheMa);