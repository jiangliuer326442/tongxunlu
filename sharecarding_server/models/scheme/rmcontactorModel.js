/**
 * Created by Administrator on 2015/12/10.
 */
/**
 * Created by Administrator on 2015/11/13.
 */
var mongoose = require("mongoose");  //  顶会议用户组件
var Schema = mongoose.Schema;    //  创建模型
/**
 * 删除联系人记录表
 */
var rmcontactorScheMa = new Schema({
    uid: {
        type: Schema.Types.ObjectId,
        required: true
    },//会员id
    phone: {
        type: "String",
        required: true
    },//被删除的手机号
    addtime: {
        type: Date,
        required: true,
        default: Date.now
    }//删除时间
});
module.exports = mongoose.model('rmdphones', rmcontactorScheMa);