var userModel = require('../../models/scheme/usersModel');
var phonesModel = require('../../models/scheme/phonesModel');
var chgphoModel = require('../../models/scheme/chgphoModel');
var tokenModel = require('../../models/scheme/tokenModel');
var contactsModel = require('../../models/scheme/contactsModel');
var rmcontactorModel = require('../../models/scheme/rmcontactorModel');
var cardModel = require('../../models/scheme/cardModel');
var request = require('request');
var async = require('async');
//登录
exports.login = function(req, res, next){
    var phone = req.body.phone;//手机号
    var password = req.body.password;//密码
    var uuid = req.body.uuid;//设备唯一码
    var lng = req.body.lng;//经度
    var lat = req.body.lat;//纬度
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    md5.update(password);
    password = md5.digest('hex');
    userModel.findOne({phone: phone, pwd: password}, function(err, user){
        if(err){
            console.log(err);
        }
        if(!user){
            res.send(req.helper.return_json(502,"用户名或密码错误"));
        }else{
            user.ltime = Date.now();
            user.lip = req.helper.getClientIp(req);
            user.ltimes =  user.ltimes + 1;
            user.lng = lng;
            user.lat = lat;
            request("http://api.map.baidu.com/geocoder/v2/?ak=CmsFDHKe4WwAXBGWC5quTwBc&callback=&location=" + lat + "," + lng + "&output=json&pois=1", function (error, response, body) {
                body = JSON.parse(body);
                user.province = body.result.addressComponent.province;
                user.city = body.result.addressComponent.city;
                user.area = body.result.addressComponent.district;
                user.address = body.result.formatted_address;
                user.save();
            });
            var token = {};
            token.uid = user._id;
            token.uuid = uuid;
            var crypto = require('crypto');
            var md5 = crypto.createHash('md5');
            md5.update(token.uid+token.uuid);
            token.token = md5.digest('hex');
			token.avatime = Date.now()+30*86400*1000;
            tokenModel.findOne({uid:token.uid, uuid:token.uuid}, function(err, token_obj){
                if(token_obj){
					token_obj.avatime = Date.now()+30*86400*1000;
                    token_obj.token = token.token;
                    token_obj.save();
                }else{
                    new tokenModel(token).save(function(err, result){
                        if(err){
                            console.log(err);
                        }
                    });
                }
            });
            res.send(req.helper.return_json(200,"登陆成功",{token:token.token}));
        }
    });

}
//修改密码
exports.chgpwd = function(req, res, next){
    var oldpwd = req.body.oldpwd;
    var password = req.body.password;
    var crypto = require('crypto');
    var md5 = crypto.createHash('md5');
    md5.update(password);
    password = md5.digest('hex');
    md5 = crypto.createHash('md5');
    md5.update(oldpwd);
    oldpwd = md5.digest('hex');
    req.helper.getToken(req, res, next, function(user_id){
        userModel.findOne({_id: user_id, pwd: oldpwd}, function(err, user){
            if(user){
                userModel.update({_id:user_id},{$set:{pwd:password}},function(err){
                    res.send(req.helper.return_json(200,"修改密码成功"));
                });
            }else{
                res.send(req.helper.return_json(501,"密码错误"));
            }
        });
    });
}
//获取用户信息
exports.getUserInfo = function(req, res, next){
    req.helper.getToken(req, res, next, function(user_id){
        userModel.findOne({_id:user_id},function(err, user_obj){
            res.send(req.helper.return_json(200,'success', user_obj));
        });
    });
}
//设置头像
exports.seticon = function(req, res, next){
    var fs=require('fs');
    var file = req.files.icon;
    var basic_path = '';
    var path = file.path;
    var name = file.name;
    var target_path = "./public/upload/" + name;
    fs.rename(path, target_path, function (err) {
        if (err) throw err;
    });
    req.helper.getToken(req, res, next, function(user_id){
        userModel.update({_id:user_id},{$set:{photo:"/upload/"+name}},function(err){
            res.send("/upload/"+name);
        });
    });
}
//设置个推id
exports.setgetui = function(req, res, next){
    var getui_id = req.body.getui_id;
    req.helper.getToken(req, res, next, function(user_id){
        userModel.update({_id:user_id},{$set:{getui_id:getui_id}},function(err){
            res.send(req.helper.return_json(200,"success"));
        });
    });
}
//注册
exports.reg = function(req, res, next) {
	var phone = req.body.phone;//手机号
	var codes = req.body.codes;//验证码
	var password = req.body.password;//密码
    var uuid = req.body.uuid;//设备唯一码
	var lng = req.body.lng;//经度
	var lat = req.body.lat;//纬度
	var realname = null;//真实姓名
	var contacters = null;//通讯录列表
	var oldphone = null;//旧号码
	var user_id = null;//用户id

    async.auto({
        ckcode: function (callback) {
            req.redis.select(14, function () {
                req.redis.hget(phone + "_reg", 'keywords', function (err, result) {
                    if (result != codes) {
                        callback(req.helper.return_json(501,"验证码错误"));
                    } else {
                        callback(null);
                    }
                });
            });
        },
        ckreg: function (callback) {
            userModel.findOne({phone: phone}).count(function (err, count) {
                if (count > 0) {
                    callback(req.helper.return_json(501,"重复注册"));
                } else {
                    callback(null);
                }
            });
        },
        getRegInfo: ['ckcode', 'ckreg',
            function (callback) {
                req.redis.select(15, function () {
                    req.redis.hgetall(phone, function (err, result) {
                        if(result) {
                            realname = result.name;
                            contacters = result.contacts;
                            oldphone = result.oldphone;
                        }else{
                            realname = req.body.realname;
                        }
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                });
            }],
        reg: ['getRegInfo',
            function (callback) {
                //提取数据
                var crypto = require('crypto');
                var md5 = crypto.createHash('md5');
                md5.update(password);
                var user = {};
                user.phone = phone;
                user.pwd = md5.digest('hex');
                user.realname = realname;
                user.rtime = Date.now();
                user.rip = req.helper.getClientIp(req);
                user.ltime = Date.now();
                user.lip = req.helper.getClientIp(req);
                user.ltimes = 1;
                user.lng = lng;
                user.lat = lat;
                user.photo = '/upload/head.jpg';
                request("http://api.map.baidu.com/geocoder/v2/?ak=CmsFDHKe4WwAXBGWC5quTwBc&callback=&location=" + lat + "," + lng + "&output=json&pois=1", function (error, response, body) {
                    body = JSON.parse(body);
                    user.province = body.result.addressComponent.province;
                    user.city = body.result.addressComponent.city;
                    user.area = body.result.addressComponent.district;
                    user.address = body.result.formatted_address;
                    new userModel(user).save(function (err, user_obj) {
                        user_id = user_obj._id;
                        if (err) {
                            callback(err);
                        } else {
                            callback(null);
                        }
                    });
                });
            }],
        mkContactors:['reg', function(callback){
            contactsModel.update({cphone:phone},{$set:{cuid:user_id}},{multi:true},function(err){
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }],
        setToken:['reg', function (callback){
            var token = {};
            token.uid = user_id;
            token.uuid = uuid;
            token.avatime = Date.now()+30*86400*1000;
            var crypto = require('crypto');
            var md5 = crypto.createHash('md5');
            md5.update(token.uid+token.uuid);
            token.token = md5.digest('hex');
            new tokenModel(token).save(function(err, result){
                if(err){
                    console.log(err);
                }
                callback(null,token.token);
            });
        }],
        lockPhone: ['reg', function (callback) {
            phonesModel.update({phone: phone}, {is_self: true}, function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }],
        chgPhone: ['reg', function (callback) {
            if(oldphone) {
                var chgpho = {};
                chgpho.uid = user_id;
                chgpho.oldphone = oldphone;
                chgpho.newphone = phone;
                new chgphoModel(chgpho).save(function (err) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }else{
                callback(null);
            }
        }],
        saveContacts: ['chgPhone', function (callback) {
            if(contacters) {
                require('../../models/contactsModel').saveContacts(user_id, contacters);
            }
            callback(null);
        }],
    },
    function(err, results){
        if(err){
            res.send(err);
        }else{
            res.send(req.helper.return_json(200,"注册成功",{token:results.setToken}));
        }
    });
};
//验证手机号
exports.ckphone = function(req, res, next) {
    var phone = req.body.phone;//手机号
    userModel.findOne({phone: phone}).count(function (err, count) {
        if (count > 0) {
            res.send(req.helper.return_json(1001,"手机号已经注册会员了哦，使用这个手机号登录，然后更换号码吧╮(╯-╰)╭"));
        } else {
            res.send(req.helper.return_json(200,'你的姓名叫什么？请填写您的<span style="color: red;">真实姓名</span>哦，不然好友怎么认识您╮(╯-╰)╭'));
        }
    });
}
//更换手机号
exports.chgphones = function(req, res, next) {
    var phone = req.body.phone;//新手机号
    var codes = req.body.codes;//验证码
    var uid = null;
    var oldphone = null;
    var realname = null;
    async.auto({
            ckcode: function (callback) {
                req.redis.select(14, function () {
                    req.redis.hget(phone + "_chgphone", 'keywords', function (err, result) {
                        if (result != codes) {
                            callback(req.helper.return_json(501,"验证码错误"));
                        } else {
                            callback(null);
                        }
                    });
                });
            },
            ckreg: function (callback) {
                userModel.findOne({phone: phone}).count(function (err, count) {
                    if (count > 0) {
                        callback(req.helper.return_json(501,"手机号已被使用"));
                    } else {
                        callback(null);
                    }
                });
            },
            oldphone: ['ckcode', 'ckreg',
                function (callback) {
                    req.helper.getToken(req, res, next, function(user_id){
                        uid = user_id;
                        userModel.findOne({_id: user_id}, function (err, userObj) {
                            oldphone = userObj.phone;
                            realname = userObj.realname;
                            callback(null);
                        });
                    });
                }],
            savephone:["oldphone",function(callback){
                phonesModel.update({phone:oldphone},{$set:{is_self:false}});
                //加入手机号到号码库
                phonesModel.findOne({phone: phone}, function (err, phone_obj) {
                    //新号码提交
                    if (phone_obj == null) {
                        var phones = {};
                        phones.phone = phone;
                        phones.master = realname;
                        phones.nettype = req.helper.getnettype(phones.phone);
                        phones.is_self = true;
                        new phonesModel(phones).save();
                    } else {
                        phone_obj.master = realname;
                        phone_obj.is_self = true;
                        phone_obj.save();
                    }
                });
                callback(null);
            }],
            chgphone:['oldphone',
                function(callback){
                    chgphoModel.remove({uid: uid}, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        var chgpho = {};
                        chgpho.uid = uid;
                        chgpho.oldphone = oldphone;
                        chgpho.newphone = phone;
                        new chgphoModel(chgpho).save();
                    });
                    contactsModel.update({cuid:uid},{$set:{cphone:phone}},{multi:true},function(err,result){
                        if(err){
                            console.log(err);
                        }
                    });
                    rmcontactorModel.remove({phone: phone},function(err){
                        if(err){
                            console.log(err);
                        }
                    });
                    userModel.update({_id:uid},{$set:{phone:phone}},function(err){
                        if(err){
                            console.log(err);
                        }else{
                            callback(null);
                        }
                    });
                }],
        },
        function(err, results){
            if(err){
                res.send(err);
            }else{
                res.send(req.helper.return_json(200,"更换号码成功",{token:results.setToken}));
            }
        });
};
//编辑名片
exports.editcard = function(req, res, next) {
    var company = req.body.company;//公司名称
    var e_company = req.body.e_company || '';//公司英文名称
    var position = req.body.position;//职位
    var ctel = req.body.ctel || '';//服务热线
    var cqq = req.body.cqq || '';//QQ号码
    var caddress = req.body.caddress || '';//公司地址
    var cweb = req.body.cweb || '';//公司网址
    var cbusiness = req.body.cbusiness || '';//经营业务
    var card = {};
    req.helper.getToken(req, res, next, function(user_id){
        cardModel.findOne({_id: user_id}, function (err, card_obj) {
            if (card_obj) {
                card_obj.company = company;
                card_obj.e_company = e_company;
                card_obj.position = position;
                card_obj.ctel = ctel;
                card_obj.cqq = cqq;
                card_obj.cweb = cweb;
                card_obj.caddress = caddress;
                card_obj.cbusiness = cbusiness;
                card_obj.save();
            } else {
                card._id = user_id;
                card.company = company;
                card.e_company = e_company;
                card.position = position;
                card.ctel = ctel;
                card.cqq = cqq;
                card.cweb = cweb;
                card.caddress = caddress;
                card.cbusiness = cbusiness;
                new cardModel(card).save(function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        });
    });
    res.send(req.helper.return_json(200,"保存名片成功"));
};
//查看名片
exports.getmycard = function(req, res, next) {
    req.helper.getToken(req, res, next, function(user_id){
        userModel.findOne({_id:user_id},function(err, user_obj){
            cardModel.findOne({_id: user_id}, function (err, card_obj) {
                var result = {};
                result.name = user_obj.realname;
                result.phone = user_obj.phone;
                if(card_obj) {
                    result.cweb = card_obj.cweb;
                    result.cbusiness = card_obj.cbusiness;
                    result.caddress = card_obj.caddress;
                    result.cqq = card_obj.cqq;
                    result.ctel = card_obj.ctel;
                    result.position = card_obj.position;
                    result.e_company = card_obj.e_company;
                    result.company = card_obj.company;
                    result.photo = user_obj.photo;
                }
                res.send(req.helper.return_json(200,"获取名片成功",result));
            });
        });
    });
};