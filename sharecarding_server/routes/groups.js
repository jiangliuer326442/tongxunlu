/**
 * Created by Administrator on 2015/12/17.
 */
var groupsModel = require('../models/scheme/groupsModel');
var groupsmemberModel = require('../models/scheme/groupsmemberModel');
//创建群
exports.buildGroup = function(req, res, next){
    var name = req.body.name;
    req.helper.getToken(req, res, next, function(user_id){
        //记录删除记录
        var group = {};
        group.lord = user_id;
        group.name = name;
        group.number = Date.now().toString();
        new groupsModel(group).save(function(err, groupObj){
            var groupmember = {};
            groupmember.group = groupObj._id;
            groupmember.uid = user_id;
            new groupsmemberModel(groupmember).save();
        });
        res.send(req.helper.return_json(200,"创建群成功"));
    });
}

//加入群
exports.addGroup = function(req, res, next){
    var number = req.body.number;
    req.helper.getToken(req, res, next, function(user_id){
        groupsModel.findOne({number:number},function(err, groupObj){
            if(groupObj){
                groupsmemberModel.findOne({group:groupObj._id,uid:user_id},function(err, groupmemberObj){
                    if(groupmemberObj){
                        res.send(req.helper.return_json(501,"您已加入群"));
                    }else{
                        var groupmember = {};
                        groupmember.group = groupObj._id;
                        groupmember.uid = user_id;
                        new groupsmemberModel(groupmember).save();
                        res.send(req.helper.return_json(200,"加入群成功"));
                    }
                });
            }else{
                res.send(req.helper.return_json(501,"群不存在"));
            }
        });
    });
}

//群列表
exports.listGroup = function(req, res, next){
    req.helper.getToken(req, res, next, function(user_id){
        groupsmemberModel.find({uid:user_id},function(err, groupmember_arr){
            var group_arr = [];
            var group_num = groupmember_arr.length;
            for(var i=0; i<group_num; i++){
                var t = function(i) {
                    groupsModel.findOne({_id: groupmember_arr[i].group}, function (err, groupObj) {
                        group_arr.push(groupObj);
                        if (i+1 == group_num) {
                            res.send(req.helper.return_json(200, "success", group_arr));
                        }
                    });
                }
                t(i);
            }
            if(group_num == 0){
                res.send(req.helper.return_json(200, "success", group_arr));
            }
        });
    });
}

//群成员列表
exports.listMembers = function(req, res, next){
    var number = req.body.number;
    req.helper.getToken(req, res, next, function(user_id){
        groupsModel.findOne({number:number}, function(err, group_obj){
            if(group_obj) {
                groupsmemberModel.find({group: group_obj._id}, function (err, groupmember_arr) {
                    var usersModel = require('../models/scheme/usersModel');
                    var member_num = groupmember_arr.length;
                    var contactor = "";
                    var count = 0;
                    for (var i = 0; i < member_num; i++) {
                        var t = function (i) {
                            usersModel.findOne({_id: groupmember_arr[i].uid}, function (err, userObj) {
                                contactor += userObj.realname + ":" + userObj.phone + ":" + userObj.photo + ":" + userObj.address + "|";
                                count++;
                                if (count == member_num) {
                                    res.send(req.helper.return_json(200, "success", contactor));
                                }
                            });
                        }
                        t(i);
                    }
                });
            }else{
                res.send(req.helper.return_json(501, "群不存在"));
            }
        });
    });
};

//退出群
exports.leaveGroup = function(req, res, next){
    var number = req.body.number;
    req.helper.getToken(req, res, next, function(user_id){
        groupsModel.findOne({number:number}, function(err, group_obj){
            if(group_obj) {
                //判断当前用户是否是群主
                if (group_obj.lord.toString() == user_id.toString()) {
                    //群主退出则删除整个群和群成员
                    console.log(group_obj);
                    groupsModel.remove({number: number}, function (err) {
                    });
                    groupsmemberModel.remove({group: group_obj._id}, function (err) {
                    });
                } else {
                    //群成员退出则删除该成员
                    groupsmemberModel.remove({group: group_obj._id, uid: user_id}, function (err) {
                    });
                }
            }
        });
        res.send(req.helper.return_json(200, "退出群成功"));
    });
}