/**
 * Created by Administrator on 2015/11/14 0014.
 */

//获取用户id
exports.getToken = function(req, res, next, cb){
    var token = req.body.token;
    if(!token){
        token = req.query.token;
    }
    var tokenModel = require('../models/scheme/tokenModel');
    tokenModel.findOne({token:token,avatime:{$gt:Date.now()}},function(err,token_obj){
        if(token_obj == null){
            res.send(req.helper.return_json(403,"尚未登录"));
        }else{
            var user_id = token_obj.uid;
            cb(user_id);
        }
    });
}

//返回json
exports.return_json = function(status,info,data){
    var result = {};
    result.status = status;
    result.info = info;
    result.data = arguments[2] ? arguments[2] : {};
    return result;
}

//姓名验证
exports.check_surname = function (str) {
    if(str.length>3){
        return false;
    }
    var str = str.substr(0, 1); //截取用户提交的用户名的前两字节，也就是姓。
    var surname = " 赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤 滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵堪汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董粱杜阮蓝闵席季麻强贾路娄危江童颜郭 梅盛林刁钟徐邱骆高夏蔡田樊胡凌霍虞万支柯咎管卢莫经房裘缪干解应宗宣丁贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊於惠甄魏加封芮羿储靳汲邴糜松 井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘钭厉戎祖武符刘姜詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲台从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥能苍双 闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍郤璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庚终暨居衡步都耿满弘匡国文寇广禄阙东 殴殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后江红游竺权逯盖益桓公万俟司马上官欧阳夏侯诸葛闻人东方赫连皇甫尉迟公羊 澹台公冶宗政濮阳淳于仲孙太叔申屠公孙乐正轩辕令狐钟离闾丘长孙慕容鲜于宇文司徒司空亓官司寇仉督子车颛孙端木巫马公西漆雕乐正壤驷公良拓拔夹谷宰父谷粱 晋楚闫法汝鄢涂钦段干百里东郭南门呼延妫海羊舌微生岳帅缑亢况後有琴梁丘左丘东门西门商牟佘佴伯赏南宫墨哈谯笪年爱阳佟第五言福";
    r = surname.search(str); // 查找字符串。
    if (r == -1) {
        return false;
    }
    else{
        return true;
    }
}

//获取客户端ip
exports.getClientIp = function(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};

//提取手机号
exports.get_mobile = function(str){
    var str = str.replace(" ","");
    str = str.replace(/-/g,"");
    str = str.replace("+86","");
    var mobileExp = new RegExp("^[1][3-8]\\d{9}$");
    if(mobileExp.test(str)){
        return str;
    }else{
        return "";
    }
}


/**
 * 返回类型
 1 中国移动
 2 中国联通
 3 中国电信
 0 无法识别
 **/

exports.getnettype = function(phoneno){
    var regex = /^(134|135|136|137|138|139|150|151|157|158|159)[0-9]{8}$/;
    if(regex.test(phoneno)){
        return "移动";
    }
    regex = /^(130|131|132|155|156)[0-9]{8}$/;
    if(regex.test(phoneno)){
        return "联通";
    }
    regex = /^(133|153|189)[0-9]{8}$/;
    if(regex.test(phoneno)){
        return "电信";
    }
    return "未知";
}