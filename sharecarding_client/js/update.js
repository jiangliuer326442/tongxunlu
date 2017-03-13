var wgtVer=null;
mui.plusReady(function(){
	plus.runtime.getProperty(plus.runtime.appid,function(inf){
        wgtVer=inf.version;
        checkUpdate();
    });
});

// 检测更新
var checkUrl= server + "/update.json";
function checkUpdate(){
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        switch(xhr.readyState){
            case 4:
            if(xhr.status==200){
            	var res_string = xhr.responseText;
            	var res_obj = JSON.parse(res_string);
                var newVer= res_obj.version;
                if(wgtVer&&newVer&&(wgtVer!=newVer)){
                	if(res_obj.forse == 1){
						var options = {cover:false};
						str = "乐享名片发现新版本"+newVer+"，正在升级中";
						plus.push.createMessage( str, "升级提醒", options );
                    	downWgt(res_obj.url);  // 下载升级包
                    }else{
                    	if(Date.now().toString()-plus.storage.getItem("lastrefuse")>86400*1000){
							var btnArray = ['立即升级', '暂不升级'];
							mui.confirm("发现新版本"+newVer+"，是否升级？", '升级提醒', btnArray, function(e) {
								if (e.index == 0) {
									plus.runtime.openURL(res_obj.url)
								} else {
									plus.storage.setItem("lastrefuse",Date.now().toString());
									return;
								}
							})
						}
                    }
                }else{

                }
            }else{
            }
            break;
            default:
            break;
        }
    }
    xhr.open('GET',checkUrl);
    xhr.send();
}

function downWgt(wgtUrl){
    plus.downloader.createDownload( wgtUrl, {filename:"_doc/update/"}, function(d,status){
        if ( status == 200 ) { 
            installWgt(d.filename); // 安装wgt包
        } else {
        }
    }).start();
}

// 更新应用资源
function installWgt(path){
    plus.nativeUI.showWaiting("安装wgt文件...");
    plus.runtime.install(path,{},function(){
        plus.nativeUI.closeWaiting();
        plus.nativeUI.alert("应用资源更新完成！",function(){
            plus.runtime.restart();
        });
    },function(e){
        plus.nativeUI.closeWaiting();
        console.log("安装wgt文件失败["+e.code+"]："+e.message);
        plus.nativeUI.alert("安装wgt文件失败["+e.code+"]："+e.message);
    });
}