var phonesModel = require('../models/scheme/phonesModel');
var request = require('request');
//发送宣传广告
exports.sendads = function(req, res, next) {
    phonesModel.find({}, function (err, phones) {
        for(var i in phones){
            var t = function(name,phone){
                var content = name + "你好，快过年了，你的好友邀请你一起使用乐享名片，这样，同学聚会的时候联系起来就方便多了。还有，换号码记得更新一下哦，下载地址：http://a.app.qq.com/o/simple.jsp?pkgname=com.ruby.sharecarding";
                request('http://smsapi.c123.cn/OpenPlatform/OpenApi?action=sendOnce&ac=1001@500925150001&authkey=E43321F7426B924A90178290BC46BA88&cgid=1891&c=' + decodeURI(encodeURI(encodeURI(content))) + '&m=' + phone, function (error, response, body) {});
            };
            t(phones[i].master,phones[i].phone);
        }
    });
};