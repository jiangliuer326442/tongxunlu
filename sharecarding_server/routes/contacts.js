/**
 * Created by Administrator on 2015/12/3.
 */
var contactsModel = require('../models/scheme/contactsModel');
var userModel = require('../models/scheme/usersModel');
var rmcontactorModel = require('../models/scheme/rmcontactorModel');
var cardModel = require('../models/scheme/cardModel');
var request = require('request');
//获取通讯录列表
exports.getContacts = function(req, res, next){
    var lng = req.body.lng;//经度
    var lat = req.body.lat;//纬度
    req.helper.getToken(req, res, next, function(user_id){
        userModel.findOne({_id: user_id}, function(err, user){
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
        });

        contactsModel.find({
            uid: user_id
        }, function (err, contactor_arr){
            var result = "";
            var count = 0;
            for(var i in contactor_arr){
                var t = function(i) {
                    userModel.findOne({_id: contactor_arr[i].cuid}, function (err, userObj) {
                        if (userObj) {
                            cardModel.findOne({_id: userObj._id}, function(err, cardObj){
                                if(cardObj){
                                    result += contactor_arr[i].cname + ":" + contactor_arr[i].cphone + ":" + userObj.photo + ":" + userObj.address + ":" + userObj.city+":"+userObj.area + ":" + cardObj.company+":"+cardObj.position + "|";
                                }else{
                                    result += contactor_arr[i].cname + ":" + contactor_arr[i].cphone + ":" + userObj.photo + ":" + userObj.address + ":" + userObj.city+":"+userObj.area + "|";
                                }
                                count++;
                                if (count==contactor_arr.length) {
                                    console.log(result)
                                    res.send(req.helper.return_json(200, "记录成功", result));
                                }
                            });
                        } else {
                            count++;
                            if (count==contactor_arr.length) {
                                res.send(req.helper.return_json(200, "记录成功", result));
                            }
                            result += contactor_arr[i].cname + ":" + contactor_arr[i].cphone + "|";
                        }
                    })
                };
                t(i);
            }
        });
    });
};

//删除联系人
exports.rmContacts = function(req, res, next){
    var cphone = req.body.phone;
    req.helper.getToken(req, res, next, function(user_id){
        //记录删除记录
        var rmcontactor = {};
        rmcontactor.uid = user_id;
        rmcontactor.phone = cphone;
        new rmcontactorModel(rmcontactor).save();
        contactsModel.remove({uid:user_id,cphone:cphone},function(err){
            if(err){
                console.log(err);
            }
            res.send(req.helper.return_json(200,"删除联系人成功"));
        });
    });
};

//编辑联系人
exports.editContacts = function(req, res, next){
    //删除旧的联系人
    var cphone = req.body.oldphone;
    req.helper.getToken(req, res, next, function(user_id){
        //记录删除记录
        var rmcontactor = {};
        rmcontactor.uid = user_id;
        rmcontactor.phone = cphone;
        new rmcontactorModel(rmcontactor).save();
        contactsModel.remove({uid:user_id,cphone:cphone},function(err){
            if(err){
                console.log(err);
            }
            require('./phones.js').collect(req, res, next);
        });
    });
}