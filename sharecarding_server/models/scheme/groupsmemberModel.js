/**
 * Created by Administrator on 2015/12/17.
 */
/**
 * Created by Administrator on 2015/11/22.
 */
var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
/**
 * 群组成员表
 */
var groupsmemberScheMa = new Schema({
    group: {
        type: Schema.Types.ObjectId,
        required: true
    },//群组id
    uid: {
        type: "String",
        required: true
    },//群成员id
    addtime: {
        type: Date,
        required: true,
        default: Date.now
    }//建群时间
});
module.exports = mongoose.model('groupsmember', groupsmemberScheMa);