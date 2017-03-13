/**
 * Created by Administrator on 2015/11/17.
 */
var msgModel = require('../models/msgModel');
/**
 * 收集手机号码
 * 发送验证短信
 * 14号数据库存储验证短信
 */
exports.sendrcode = function(req, res, next) {
    //发送注册短信
    msgModel.sendrcode(req,function(err){
        if(err){
            res.send(err);
        }else{
            res.send(req.helper.return_json(200,"发送成功"));
        }
    });
};
//发送更换手机号验证码
exports.sendchgphonecode = function(req, res, next) {
    //发送注册短信
    msgModel.sendccode(req,function(err){
        if(err){
            res.send(err);
        }else{
            res.send(req.helper.return_json(200,"发送成功"));
        }
    });
};