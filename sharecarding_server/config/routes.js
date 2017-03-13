/**
 * '网址'=>'控制器'
 * 所有网址能访问的内容对应的函数名必须是get或post或all
 */
module.exports = {
    "collectphone":"phones/collect",//收集手机通讯录数据
    "rediscontacts":"phones/contactsbuf",//手机通讯录数据缓存
    "sendrcode":"msg/sendrcode",//发送注册短信验证码
    "sendchgphonecode":"msg/sendchgphonecode",//发送注册短信验证码
    "register": "users/common/reg",//注册
    "chgphones":"users/common/chgphones",//更换手机号
    "ckphone": "users/common/ckphone",//验证手机号
    "login": "users/common/login",//登录
    "chgpwd": "users/common/chgpwd",//修改密码
    "seticon": "users/common/seticon",//设置头像
    "getuserinfo": "users/common/getUserInfo",//获取用户信息
    'getcontactors': "contacts/getContacts",//获取通讯录联系人列表
    'removecontactors': "contacts/rmContacts",//删除通讯录中的某个联系人
    'editcontactor':"contacts/editContacts",//编辑通讯中的某个联系人
    'buildgroup':"groups/buildGroup",//创建群
    'addgroup':"groups/addGroup",//加入群
    'listgroup':"groups/listGroup",//群列表
    'listmembers':"groups/listMembers",//群成员列表
    'leavegroup':"groups/leaveGroup",//离开群
    'editcard':"users/common/editcard",//编辑名片
    'getmycard':"users/common/getmycard",//查看我的名片
    'getcard':"card/getcard",//查看名片
    'setgetui':"users/common/setgetui",//设置个推用户id
    'sendads':"activity/sendads",//发送广告
    "downloads.html": "index/downloads",//软件下载
    "": "index/index"//首页
};