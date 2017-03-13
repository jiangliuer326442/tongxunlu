/**
 * Created by Administrator on 2015/11/18.
 */
var msgrcdModel = require('./scheme/msgrcdModel');
var request = require('request');
var crypto = require('crypto');

//var url = "https://sandboxapp.cloopen.com:8883"; //开发
var url = "https://app.cloopen.com:8883"; //生产

var AccountSid = "aaf98f8953cadc690153e0b928134610";
var AccountToken = "42a9d291ba7044baa949c859386ae4e1";
var AppId = "aaf98f895427cf5001543437c6b61488";

var SoftVersion = "2013-12-26";
url = url +"/"+SoftVersion+"/Accounts/"+AccountSid+"/SMS/TemplateSMS?sig="

var sendMessage = function(phone, content){
    request('http://smsapi.c123.cn/OpenPlatform/OpenApi?action=sendOnce&ac=1001@500925150001&authkey=E43321F7426B924A90178290BC46BA88&cgid=1891&c='+decodeURI(encodeURI(encodeURI(content)))+'&m='+phone, function (error, response, body){});
}
//发送注册验证码
exports.sendrcode = function(req, cb){
    var phone = req.body.phone;
    req.redis.select(14,function(){
        req.redis.hget(phone+"_reg",'keywords',function(err,result){
            if(err){
                console.log(err);
            }
            if(result){
                cb(req.helper.return_json(501,"重复发送"));
            }else{
                var keywords = Math.round(Math.random()*100000);
				
				
				var mobile = phone;
				var code = keywords;
				var tmpl = "81513";


				var date =new Date();
				var hour = date.getHours();
				var day = date.getDate();
				if(hour>=16){
					hour = hour+8-24;
					day = day+1;
				}else{
					hour = hour+8;
				}
				var year = date.getFullYear().toString();
				var month = ((date.getMonth()+1)<10?"0"+(date.getMonth()+1).toString():(date.getMonth()+1).toString());
				day = day<10?("0"+day.toString()):day.toString();
				hour = hour<10?"0"+hour.toString():hour.toString();
				var minute = date.getMinutes()<10?("0"+date.getMinutes().toString()):date.getMinutes().toString();
				var second = (date.getSeconds())<10?"0"+(date.getSeconds()).toString():(date.getSeconds()).toString();
				var Batch = year+month+day+hour+minute+second;
				var md5 = crypto.createHash('md5');
				md5.update(AccountSid+AccountToken+Batch);
				var sig = md5.digest('hex').toUpperCase();
				var authen = new Buffer(AccountSid + ":" + Batch).toString("base64");

				url= url + sig;
				var body = {};
					body.to = mobile;
					body.templateId = tmpl;
					body.appId = AppId;
					body.datas = [];
					body.datas.push(code);
				var header = {"Accept": "application/json","Content-Type":"application/json;charset=utf-8","Authorization":authen};

				var options = {
					headers: header,
					url: url,
					method: 'POST',
					json:true,
					body: body
				};

				function callback(error, response, data) {
					var msg = {};
					msg.phone = phone;
					msg.keywords = keywords;
					msg.reason = "register";
					msg.ip = req.helper.getClientIp(req);
					msg.addtime = Date.now();
					msg.result = true;
					msg.content = keywords;
					new msgrcdModel(msg).save(function(err){
						if(err){
							console.log(err);
						}
					});
					req.redis.hmset(phone+"_reg",msg,function(err){
						if(err){
							console.log(err);
						}
						req.redis.expire(phone+"_reg",120);
					});
				}
				request(options, callback);
				cb(null);
            }
        });
    });
}
//发送修改手机号验证码
exports.sendccode = function(req, cb){
    var phone = req.body.phone;
    req.redis.select(14,function(){
        req.redis.hget(phone+"_chgphone",'keywords',function(err,result){
            if(err){
                console.log(err);
            }
            if(result){
                cb(req.helper.return_json(501,"重复发送"));
            }else{
                var keywords = Math.round(Math.random()*100000);
				
				
				var mobile = phone;
				var code = keywords;
				var tmpl = "81515";


				var date =new Date();
				var hour = date.getHours();
				var day = date.getDate();
				if(hour>=16){
					hour = hour+8-24;
					day = day+1;
				}else{
					hour = hour+8;
				}
				var year = date.getFullYear().toString();
				var month = ((date.getMonth()+1)<10?"0"+(date.getMonth()+1).toString():(date.getMonth()+1).toString());
				day = day<10?("0"+day.toString()):day.toString();
				hour = hour<10?"0"+hour.toString():hour.toString();
				var minute = date.getMinutes()<10?("0"+date.getMinutes().toString()):date.getMinutes().toString();
				var second = (date.getSeconds())<10?"0"+(date.getSeconds()).toString():(date.getSeconds()).toString();
				var Batch = year+month+day+hour+minute+second;
				var md5 = crypto.createHash('md5');
				md5.update(AccountSid+AccountToken+Batch);
				var sig = md5.digest('hex').toUpperCase();
				var authen = new Buffer(AccountSid + ":" + Batch).toString("base64");

				url= url + sig;
				var body = {};
					body.to = mobile;
					body.templateId = tmpl;
					body.appId = AppId;
					body.datas = [];
					body.datas.push(code);
				var header = {"Accept": "application/json","Content-Type":"application/json;charset=utf-8","Authorization":authen};

				var options = {
					headers: header,
					url: url,
					method: 'POST',
					json:true,
					body: body
				};

				function callback(error, response, data) {
					var msg = {};
					msg.phone = phone;
					msg.keywords = keywords;
					msg.reason = "chgphone";
					msg.ip = req.helper.getClientIp(req);
					msg.addtime = Date.now();
					msg.result = true;
					msg.content = keywords;
					new msgrcdModel(msg).save(function(err){
						if(err){
							console.log(err);
						}
					});
					req.redis.hmset(phone+"_chgphone",msg,function(err){
						if(err){
							console.log(err);
						}
						req.redis.expire(phone+"_chgphone",120);
					});
				}
				request(options, callback);
				cb(null);
            }
        });
    });
}
