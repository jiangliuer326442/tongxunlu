/**
 * Created by Administrator on 2015/12/3.
 */
var chgphoModel = require('./scheme/chgphoModel');
var contactsModel = require('./scheme/contactsModel');
var userModel = require('./scheme/usersModel');
var rmcontactorModel = require('./scheme/rmcontactorModel');
var request = require('request');
var sendMessage = function(phone, content){
    request('http://smsapi.c123.cn/OpenPlatform/OpenApi?action=sendOnce&ac=1001@500925150001&authkey=E43321F7426B924A90178290BC46BA88&cgid=1891&c='+decodeURI(encodeURI(encodeURI(content)))+'&m='+phone, function (error, response, body){});
}
//保存通讯录
exports.saveContacts = function(user_id, contacters){
    var realname = null,realphone = null;
    userModel.findOne({_id: user_id}, function (err, userObj) {
        realname = userObj.realname;
        realphone = userObj.phone;
        //保存通讯录
        var contacts_arr = contacters.split("|");
        for (var i in contacts_arr) {
            var t = function (i) {
                var contactor_arr = contacts_arr[i].split(":");
                var contactor = {};
                contactor.uid = user_id;
                contactor.cphone = contactor_arr[1];
                contactor.cname = contactor_arr[0];
                if (contactor.cphone && contactor.cname) {
                    var insertContactor = function(contactor) {
                        //读取该手机号的换号记录
                        chgphoModel.findOne({oldphone: contactor.cphone}, function (err, chgpho_obj) {
                            //存在有效的换号记录
                            if (chgpho_obj && chgpho_obj.newphone != chgpho_obj.oldphone) {
                                //删除自己联系人中的旧号码
                                contactsModel.remove({uid: user_id, cphone: contactor.cphone}, function (err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                                contactor.cphone = chgpho_obj.newphone;
                                /*
                                 * 检测新号码在待插入的数组中是否已经存在
                                 * 如果已经存在，则过滤该操作
                                 */
                                for (var t in contacts_arr) {
                                    var contactor_arr2 = contacts_arr[t].split(":");
                                    if (contactor.cphone == contactor_arr2[1]) {
                                        return;
                                    }
                                }
                            }
                            //查看通讯录中联系人是否已经存在，如果已存在就更新联系人姓名，否则增加联系人
                            contactsModel.findOne({
                                uid: user_id,
                                cphone: contactor.cphone
                            }, function (err, contactor_obj) {
                                userModel.findOne({phone: contactor.cphone}, function (err, user_obj) {
                                    if (user_obj) {
                                        contactor.cuid = user_obj._id;
                                    } else {
                                        contactor.cuid = null;
                                    }
                                    if (contactor_obj) {
                                        contactor_obj.cname = contactor_arr[0];
                                        contactor_obj.cuid = contactor.cuid;
                                        contactor_obj.save();
                                    } else {
                                        new contactsModel(contactor).save();
                                        if(realname && realphone){
                                            var content = contactor.cname+"你好，我是"+realname+",目前的手机号码是"+realphone+",如有需要请惠存。以后若联系不到我，记得使用乐享名片更新一下自己的通讯录，下载地址：http://a.app.qq.com/o/simple.jsp?pkgname=com.ruby.sharecarding";
                                            var phone = contactor.cphone;
                                            sendMessage(phone,content);
                                        }
                                    }
                                });
                            });
                        });
                    }
                    //批量导入联系人，拒绝导入已经删除过的联系人
                    if(contacts_arr.length > 2){
                        rmcontactorModel.findOne({uid: user_id, phone: contactor.cphone}, function(err, rmcontactor_obj){
                            if(rmcontactor_obj){
                                return;
                            }
                            insertContactor(contactor);
                        });
                    }else{
                        insertContactor(contactor);
                    }
                }
            };
            t(i);
        };
    });
};