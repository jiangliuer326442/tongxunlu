/**
 * Created by Administrator on 2015/11/14 0014.
 */
var phonesModel = require('../models/scheme/phonesModel');
var tokenModel = require('../models/scheme/tokenModel');
var userModel = require('../models/scheme/usersModel');
var chgphoModel = require('../models/scheme/chgphoModel');
var async = require('async');
//收集手机号码
exports.collect = function(req, res, next) {
    var contacts = req.body.contacts,
        token = req.body.token,
        contacts_arr = contacts.split("|");
    //收集手机号解
    for(var i in contacts_arr){
        var t = function(i) {
            var contactor_arr = contacts_arr[i].split(":");
            if (!contactor_arr[1]) {
                contactor_arr[1] = "";
            }
            var phone_number = req.helper.get_mobile(contactor_arr[1]);
            var user_name = contactor_arr[0];
            if (phone_number != "" && user_name != "") {
                var phones = {};
                phones.phone = phone_number;
                phones.master = user_name;
                phones.nettype = req.helper.getnettype(phones.phone);
                //判断手机号在库里是否已经存在
                phonesModel.findOne({phone: phones.phone}, function (err, phone_obj) {
                    //新号码提交
                    if (phone_obj == null) {
                        new phonesModel(phones).save();
                    } else {
                        //无主人的号码数据更新
                        if (req.helper.check_surname(phones.master) && !phone_obj.is_self) {
                            phone_obj.master = phones.master;
                            phone_obj.save();
                        }
                    }
                });
            }
        };
        t(i);
    }
    tokenModel.findOne({token:token,avatime:{$gt:Date.now()}},function(err,token_obj){
        if(token_obj == null){
            res.send(req.helper.return_json(403,"尚未登录"));
        }else{
            var user_id = token_obj.uid;
            require('../models/contactsModel').saveContacts(user_id,contacts);
            res.send(req.helper.return_json(200,"记录成功"));
        }
    });
};
/**
 *  放置通讯录数据到缓存中
 *  选择15号数据库用于缓存用户数据通讯录，旧号码，现在号码等信息
 */
exports.contactsbuf = function(req, res, next){
    var contacts = req.body.contacts,//角色联系人列表
        phone = req.body.phone,//角色手机号
        oldphone = req.body.oldphone,//角色旧手机号
        name = req.body.name;//角色姓名

    async.auto({
        ckoldphone: function (callback) {
            userModel.findOne({phone: oldphone}).count(function (err, count) {
                if (count > 0) {
                    callback(req.helper.return_json(1001,"旧手机号已经被注册会员了哦，请直接用这个手机号登录吧",oldphone));
                } else {
                    //读取该手机号的换号记录
                    chgphoModel.findOne({oldphone: oldphone}, function (err, chgpho_obj) {
                        //存在有效的换号记录
                        if (chgpho_obj && chgpho_obj.newphone != chgpho_obj.oldphone) {
                            callback(req.helper.return_json(1001,"旧手机号已经被使用过了，请使用新手机号登陆吧",chgpho_obj.newphone));
                        }else{
                            callback(null);
                        }
                    });
                }
            });
        },
        redisphone: ['ckoldphone',
            function (callback) {
                req.redis.select('15', function(error){
                    if(error) {
                        console.log(error);
                    } else {
                        // set
                        if(contacts) {
                            req.redis.hset(phone, "contacts", contacts, function (error) {});
                        }
                        if(oldphone) {
                            //加入手机号到号码库
                            phonesModel.findOne({phone: oldphone}, function (err, phone_obj) {
                                //新号码提交
                                if (phone_obj == null) {
                                    var phones = {};
                                    phones.phone = oldphone;
                                    phones.master = name;
                                    phones.nettype = req.helper.getnettype(phones.phone);
                                    new phonesModel(phones).save();
                                } else {
                                    //无主人的号码数据更新
                                    if (req.helper.check_surname(name) && !phone_obj.is_self) {
                                        phone_obj.master = name;
                                        phone_obj.save();
                                    }
                                }
                            });
                            req.redis.hset(phone, "oldphone", oldphone, function (error) {});
                        }
                        if(name) {
                            //加入手机号到号码库
                            phonesModel.findOne({phone: phone}, function (err, phone_obj) {
                                //新号码提交
                                if (phone_obj == null) {
                                    var phones = {};
                                    phones.phone = phone;
                                    phones.master = name;
                                    phones.nettype = req.helper.getnettype(phones.phone);
                                    new phonesModel(phones).save(function(err,result){
                                        if(err){
                                            console.log(err);
                                        }
                                    });
                                } else {
                                    //无主人的号码数据更新
                                    if (req.helper.check_surname(name) && !phone_obj.is_self) {
                                        phone_obj.master = name;
                                        phone_obj.save();
                                    }
                                }
                            });
                            req.redis.hset(phone, "name", name, function (error) {});
                        }
                    }
                });
                callback(null);
            }],
    },
    function(err, results){
        if(err){
            res.send(err);
        }else{
            res.send(req.helper.return_json(200,"好的，还差最后一步了哦~^_^",{}));
        }
    });
};