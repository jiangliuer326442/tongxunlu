var userModel = require('../models/scheme/usersModel');
var cardModel = require('../models/scheme/cardModel');
//查看名片
exports.getcard = function(req, res, next) {
    var phone = req.body.phone;
    userModel.findOne({phone:phone},function(err, user_obj){
        cardModel.findOne({_id: user_obj._id}, function (err, card_obj) {
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
            }
            result.photo = user_obj.photo;
            res.send(req.helper.return_json(200,"获取名片成功",result));
        });
    });
};