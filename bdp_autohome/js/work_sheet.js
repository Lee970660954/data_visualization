// vue代码部分
var workSheetApp = new Vue({
	el: ".ws-body"
});


//jquery代码部分
$(function(){
	//为header导航栏中的tab添加点击事件
	$('.header-nav>.header-nav-item').each(function(index,elem){
		var itemSelected = $(this).data('selected');
		if(itemSelected){
			$(this).css({"background": "#ffffff","border-bottom": "1px solid #5182E4","color": "#5182E4"});
		}
	});
	$('.header-nav').on('click','.header-nav-item',function(){
		var $selected = $(this).data('selected');
		if($selected){
			$(this).css({"background": "#F0F2F3","border-bottom": "1px solid #F0F2F3","color": "rgba(10,18,32,.64)"});
			$(this).data('selected',false);
		}else{
			$(this).css({"background": "#ffffff","border-bottom": "1px solid #5182E4","color": "#5182E4"});
			$(this).siblings().css({"background": "#F0F2F3","border-bottom": "1px solid #F0F2F3","color": "rgba(10,18,32,.64)"}).data('selected',false);
			$(this).data('selected',true);
			var $tabName = $(this).data('tab');
			if($tabName == "dash-board"){
				window.location.href = "http://10.168.78.108/bdp_autohome/dash_board.html";
			}else if($tabName == "chart-edit"){
				window.location.href = "http://10.168.78.108/bdp_autohome/index.html";
			}else if($tabName == "data-source"){
				window.location.href = "http://10.168.78.108/bdp_autohome/data_source.html"
			}
		}
		
	})
})