// bdp_autohome项目->图表编辑页面(chart_edit.html)
// 版本: 1.0.0
// 作者: 李永健
// 页面交互设计梗概: 
//1.由于本页面在交互方面复杂、频繁调用接口的特点，因此采用jquery.js和vue.js混合开发的方式，jquery.js主要负责完成复杂的交互操作，vue.js主要负责完成数据的渲染
//2.UI方面使用的是iview，一套基于vue.js2.0的前端组件库

//vue代码部分
var chartApp = new Vue({
			el: ".main-container",
			data: {
				value1: '',//控制右侧图表标题下拉菜单的收放
				value2: '',//控制右侧图表类型下拉菜单的收放
				value3: '',//控制右侧图表备注下拉菜单的收放
				bookSearchText: "",//左侧搜索框中的内容
				strSearchResult: [],//搜索框筛选得到的text型字段
				numSearchResult: [],//搜索框筛选得到的number型字段
				searchResultShow: false,//控制搜索框筛选结果显示/隐藏的标志位
				// dmsUrl: "json/test1.json",//获取左侧侧边栏中字段数据的接口,本地环境
				dmsUrl: "http://10.23.240.21:8080/",//获取左侧侧边栏中字段数据的接口,测试环境 index/table/_fields
				layerUrl: "http://10.23.240.21:8080/index/table/_select?count=100",//获取弹出层中表格数据的接口，测试环境
				pageUrlParam: {},
				columns: [],//存储弹出层中表格的字段名数据
				tableData: [],//存放弹出层中表格具体数据
				tableDetail: {},//存放表格详细信息
				layerShow: false,
				dmsData: [],//存放所有字段数据
				strDmsData: [],//存放text型字段数据
				numDmsData: [],//存放number型字符数据
				newFiledName: "",
				newFiledClass: "",
				filedLayerClassShow: false,
				filedLayerShow: false,
				filedLayerArr: ["请选择字段类型","文本","数值","日期"]
			},
			methods: {
				//搜索框筛选字段功能
				rendSearchResult: function(){
					this.searchResultShow = true;
					this.strSearchResult = [];
					this.numSearchResult = [];
					var searchRegex = new RegExp(this.bookSearchText, 'i');//搜索框筛选字段的正则表达式，不区分大小写
					for(var i = 0;i<this.strDmsData.length;i++){
						if(this.bookSearchText == ""){
							this.searchResultShow = false;
						}else if(searchRegex.test(this.strDmsData[i].title)){
							this.strSearchResult.push(this.strDmsData[i]);
						}						
					}
					for(var i = 0;i<this.numDmsData.length;i++){
						if(this.bookSearchText == ""){
							this.searchResultShow = false;
						}else if(searchRegex.test(this.numDmsData[i].title)){
							this.numSearchResult.push(this.numDmsData[i]);
						}						
					}
				},
				layerPop: function(){
					this.layerShow = true;
				},
				closeLayer: function(){
					this.layerShow = false;
				},
				showFiledLayer: function(){
					this.filedLayerShow = !this.filedLayerShow
				},
				showFiledClass: function(){
					this.filedLayerClassShow = !this.filedLayerClassShow;
				},
				filedClassSelect: function(index){
					var selectedItem = this.$refs.selectedItem[index].innerText;
					this.newFiledClass = selectedItem;
					this.filedLayerClassShow = !this.filedLayerClassShow;
				}
			},
			mounted: function(){
				//动态拼接dmsUrl的完整路径
				var pageUrl = location.href;
				var pageUrlParam = getPageUrlParam(pageUrl);
				this.dmsUrl = this.dmsUrl + pageUrlParam.dbName + "/" + pageUrlParam.tbName + "/_fields" ;
				this.pageUrlParam = pageUrlParam;
				function getPageUrlParam(url){
					var result = {};
					var startIndex = url.indexOf('?');
					var paramStr = url.substr(startIndex+1);
					var paramArr = paramStr.split('&');
					for(var i = 0;i < paramArr.length;i++){
						result[paramArr[i].split('=')[0]] = paramArr[i].split('=')[1];
					}
					return result;
				}
				
				//调用接口获取左侧的字段数据
				this.$http.jsonp(this.dmsUrl,{params: {},jsonp: "_callback"}).then(function(response){
				    // 响应成功回调
				    this.dmsData = response.body.result.data;
				    for(var dmsItem in this.dmsData){
				    	if(this.dmsData[dmsItem].type == "text"){
				    		this.strDmsData.push(this.dmsData[dmsItem]);
				    	}else if(this.dmsData[dmsItem].type == "number"){
				    		this.numDmsData.push(this.dmsData[dmsItem]);
				    	}
				    }
				}, function(response){
				    // 响应错误回调
				    alert("接口请求失败！");
				});

				//调用接口获取弹出层中的数据
				this.$http.jsonp(this.layerUrl,{params: {},jsonp: "_callback"}).then(function(response){
					// 响应成功回调
					this.tableData = response.body.result.data;
					this.tableDetail["last_update"] = response.body.result.last_update;
					this.tableDetail["count"] = response.body.result.count;
					var column0 = response.body.result.data[0];
					var columnArr = [];
					for(var item in column0){
						columnArr.push(item);
					}
					for(var i = 0;i < columnArr.length;i++){
						var columnObj = {};
						columnObj['title'] = columnArr[i];
						columnObj['key'] = columnArr[i];
						this.columns.push(columnObj);
					}
				},function(response){
					// 响应错误回调
					alert("接口请求失败！");
				})
			}
		});




// jquery代码部分
$(function(){
	//公共接口，用于获取渲染图表所需的数据，测试环境,http://10.23.240.21:8080/index/table/_groupby?_callback=?&fields=f1,f2&tops=100&aggs=f1:count&filters=f2:45 示例
	var commonUrl = "http://10.23.240.21:8080/index/table/_groupby?_callback=?&tops=100&"
	var countFiledArr = [];//存放拖拽到中间聚合列表中的字段，以便动态拼接url
	// 自定义函数，用于拼接访问公共接口的url
	function getCommonUrlParam(){
		var dmsUrlParam = "fields=";
		var countUrlParam = "&aggs=";
		var filterUrlParam = "&filters=";
		var drillingUrl = "&drillings=";
		if(layerArr.length){
			drillingUrl += dmsFiledArr[0] + ":" + layerArr.join(",");
		}else{
			drillingUrl += "";
		}
		// if(dmsFiledArr.length){
		// 	dmsUrlParam += dmsFiledArr.join(",");
		// }else{
		// 	dmsUrlParam += null;
		// }
		dmsUrlParam += dmsFiledArr.join(",");
		countUrlParam += connectCountParam();
		filterUrlParam += connectFilterParam(filterObj);
		finalUrl = commonUrl + dmsUrlParam + countUrlParam + filterUrlParam + drillingUrl;
		return finalUrl;
	}
	// 自定义函数，返回一个随机值
	function newGuidString() {
        return 'xxxxxxxxyxxxxyxxxxyyxxxyxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

	// 自定义函数，根据传入的键值在数据数组中动态删除对应项
	function deleteItem(value,array){
		if(array[0]){
			for(var i = 0;i < array.length;i++){
				if(array[i] == value){
					array.splice(i,1)
					// testUrl1 = testUrl + array.join(",");
					// console.log(testUrl1);
					// cleanChartBox();
					// rendTable();
				}
			}
		}
	}
	
	//筛选区的下拉列表项在点击时会发送ajax请求，这里封装一个拼接url的函数；
	function connectFilterParam(object){
		var urlParam = "";
		if(JSON.stringify(object) != "{}"){
			for(var key in object){
				if(object[key].length != 0){
					urlParam += key + ":";
					for(var i = 0;i<object[key].length;i++){
						if(i < object[key].length-1){
							urlParam += object[key][i] + ",";
						}else{
							urlParam += object[key][object[key].length-1] + ";";
						}
					}
				}				
			}
			if(urlParam){
				return url = urlParam;
			}else{
				return url = "";
			}			
		}else{
			return url = "";
		}
		
	}

	//拖拽字段到聚合列表(删除聚合列表字段和改变计算方式)时会发送ajax请求，这里封装一个拼接聚合列表url参数的函数
	function connectCountParam(){
		var urlParam = "";
		if(countFiledArr.length){
			for(var i = 0;i < countFiledArr.length;i++){
				if(i < countFiledArr.length-1){
						urlParam += countFiledArr[i].filedName + ":" + countFiledArr[i].method + ";";
				}else{
						urlParam += countFiledArr[i].filedName + ":" + countFiledArr[i].method;
				}
			}
		}
		return urlParam;
	}

	//在点击聚合列表中的列表项的关闭按钮时，动态删除记录数组中的对应项
	function deleteCountArrItem(id,array){
		for(var i = 0;i < array.length;i++){
			if(array[i].filedId == id){
				array.splice(i,1);
			}
		}
	}

	//在点击聚合列表中的下拉项时，动态改变数组中的对应项
	function updateCountArrItem(id,value,array){
		if(array.length){
			for(var i = 0;i < array.length;i++){
				if(array[i].filedId == id){
					array[i].method = value;
				}
			}
		}
	}

	//渲染图表功能
	function rendTable(){
		var url = getCommonUrlParam();//测试环境的url
		// var url = "json/test3.json";// 本地环境的url
		console.log(url);
		cleanChartBox();
		if(dmsFiledArr[0]){
			$.ajax({
			method: 'get',
            url: url,
            dataType: "jsonp",
            success: function(data){
            	var arr = new Array();
                arr.push('<table class="table table-bordered  table-hover" cellspacing="1" cellpadding="1" border="1">');
                arr.push('<thead>');
                arr.push('<tr>');
                for (item in dmsFiledArr) {
                    arr.push('<th><span>');
                    arr.push(dmsFiledArr[item]);
                    arr.push('</span></th>');
                }
                arr.push('<th><span>值</span></th>');
                arr.push('</tr>');
                arr.push('</thead><tbody>');

                for (item in data.result.data) {
                    var ids = data.result.data[item].Id;
                    var score = data.result.data[item].Score;
                    arr.push('<tr>');
                    for (field in ids) {
                        arr.push('<td><span>' + ids[field] + '</span></td>');
                    }
                    arr.push('<td><span>' + score + '</span></td></tr>');
                }
                arr.push('</tbody></table>');

                $('.chart-box').html(arr.join(""));
            	
            },
            error: function(){
            	alert("数据库不存在该数据！");
            }
		})
		}
	}

	//清空图表区功能
	function cleanChartBox(){
		$('.chart-box').html("");
	}

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
				window.location.href = window.location.href;
			}else if($tabName == "work-sheet"){
				window.location.href = "http://10.168.78.108/bdp_autohome/work_sheet.html"
			}else if($tabName == "data-source"){
				window.location.href = "http://10.168.78.108/bdp_autohome/data_source.html"
			}
		}
		
	})

	// 为中间显示图表区域的功能栏添加显示响应时间的功能
	$('.data-response-time>span').each(function(index,elem){
		var showFlag = $(this).data('show');
		if(showFlag){
			$(this).css({"display" : "inline-block"});
		}else{
			$(this).css({"display" : "none"});
		}
	});
	setInterval(function(){
		$('.response-icon').css({"display" : "none"});
		$('.response-time').css({"display" : "inline-block"});
	},5000)

	//为左侧日期字段添加下拉菜单收放功能
	$('.filed-date .filed-date-down').on('click',function(){
		var ifShow = $(this).data('show');
		if(ifShow){
			$('.filed-date-list').css({"display": "none"});
			$(this).data('show',false);
			$(this).parents('li').siblings('li').css({"display": "block"});
		}else{
			$('.filed-date-list').css({"display": "block"});
			$(this).data('show',true);
			$(this).parents('li').siblings('li').css({"display": "none"});
		}
		
	})

	//为左侧的字段绑定拖拽事件
	// var chartFiled = null;
	var dmsFiledArr = [];//存放拖拽到中间维度列表中的字段名，以便动态拼接url
	var rendTableUrl = "http://10.23.240.21:8080/index/table/_groupby?tops=15&_callback=?&fields=";//获取图表数据的接口，测试环境
	// var testUrl = "json/test3.json";//获取图表数据的接口，本地环境
	$('.chart-filed-list').on('dragstart','.chart-filed',function(event){
		var filedName = $(this).children().children('span').html();
		event.originalEvent.dataTransfer.effectAllowed = "copyMove";
		event.originalEvent.dataTransfer.setData("text",filedName);
		event.originalEvent.dataTransfer.setDragImage(event.target, 0, 0);
	    return true;
	});

	//左侧字段被放置在维度列表中的交互
	$('.arg-list-dms').on('drop','ul',function(event){
		event.preventDefault();
		var filedName = event.originalEvent.dataTransfer.getData("text");
		if(dmsFiledArr.indexOf(filedName) == -1){
			dmsFiledArr.push(filedName);
			var fieldCopy = '<li class="filed-copy" data-show="false">\
						<a href="javascript:0">\
							<i class="down-btn"></i>\
							<span class="filed-name">' + filedName +'</span>\
							<i class="close-btn"></i>\
						</a>\
						<div class="filed-copy-submenu">\
							<ul>\
								<li>设置字段</li>\
								<li>自动换行</li>\
								<li>对齐方式</li>\
								<li>排序</li>\
							</ul>\
	                    </div>\
					</li>';
		    $(this).append(fieldCopy);
		}else{
			alert("请勿重复添加该字段！");
		}
		event.originalEvent.dataTransfer.clearData("text");
		// console.log(getCommonUrlParam());
		rendTable();
	})

	//为维度列表中的字段选项添加下拉菜单收放功能
	$(".arg-list-dms").on("click",".filed-copy",function(event){
	    	var oFiledCopy = $(this)[0];
	    	var show = $(this).data('show');
	    	oSubMenu = oFiledCopy.getElementsByTagName('div')[0];
	    	if(show){
	    		oSubMenu.style.visibility = 'hidden';
	    		$(this).data('show',false);
	    	}else{
	    		oSubMenu.style.visibility = 'visible';
	    		// oSubMenu.style.marginTop = 28+'px';
	    		$(this).data('show',true);
	    	}
	    	console.log(oFiledCopy.getElementsByTagName('span')[0].innerHTML)
	    	console.log($(this).data('show'));
	    })
	$('.args-row').on('dragover',function(event){
		event.originalEvent.preventDefault();
	})

	//为维度列表的选项添加删除功能
	//根据删除的字段内容来动态删除字段记录数组中的对应元素，并且重新向接口发送请求并且重新获得数据和渲染图表
	$('.arg-list-dms').on("click",".close-btn",function(event){
		event.stopPropagation();
		event.preventDefault();
		var delValue = $(this).prev('span').html();
		deleteItem(delValue,dmsFiledArr);
		// getCommonUrlParam();
		// console.log(getCommonUrlParam());
		$(this).parents('.filed-copy').remove();
		cleanChartBox();
		rendTable();
	})
	
	//左侧字段被放置在聚合列表中的交互
	$('.arg-list-count').on('drop','ul',function(event){
		event.preventDefault();
		var filedName = event.originalEvent.dataTransfer.getData("text");
		var randomStr = newGuidString();
	    var filedId = filedName + '|' + randomStr;
		var fieldCopy = '<li class="filed-copy" data-show="false" data-id="' + filedId + '">\
					<a href="javascript:0">\
						<i class="down-btn"></i>\
						<span class="filed-name">' + filedName +'</span>\
						<span>' + '(' +'</span>\
						<span class="count-method">' + '计数' + '</span><span>' +')' +'</span>\
						<i class="close-btn"></i>\
					</a>\
					<div class="filed-copy-submenu">\
						<ul>\
							<li>count</li>\
							<li>去重计数</li>\
							<li>高级计算</li>\
							<li>数值显示格式</li>\
							<li>设置字段</li>\
							<li>对齐方式</li>\
							<li>结果筛选器</li>\
							<li>排序</li>\
						</ul>\
                    </div>\
				</li>';
	    $(this).append(fieldCopy);
	    var countFiledObj = {};
	    countFiledObj['filedName'] = filedName;
	    countFiledObj['method'] = '计数';
	    countFiledObj['filedId'] = filedId;
	    countFiledArr.push(countFiledObj);
	    console.log(countFiledArr);
		event.originalEvent.dataTransfer.clearData("text");
		rendTable();
	})

	//为聚合列表的选项添加删除功能
	//根据删除的字段内容来动态删除字段记录数组中的对应元素，并且重新向接口发送请求并且重新获得数据和渲染图表
	$('.arg-list-count').on("click",".close-btn",function(event){
		event.stopPropagation();
		event.preventDefault();
		var delValue = $(this).parents('.filed-copy').data('id');
		deleteCountArrItem(delValue,countFiledArr);
		$(this).parents('.filed-copy').remove();
		rendTable();
	})

	//为聚合列表中的字段选项添加下拉菜单收放功能
	$(".arg-list-count").on("click",".filed-copy",function(event){
	    	var oFiledCopy = $(this)[0];
	    	var show = $(this).data('show');
	    	oSubMenu = oFiledCopy.getElementsByTagName('div')[0];
	    	if(show){
	    		oSubMenu.style.visibility = 'hidden';
	    		$(this).data('show',false);
	    	}else{
	    		oSubMenu.style.visibility = 'visible';
	    		// oSubMenu.style.marginTop = 28+'px';
	    		$(this).data('show',true);
	    	}
	    	// console.log(oFiledCopy.getElementsByTagName('span')[0].innerHTML)
	    	// console.log($(this).data('show'));
	    })

	//为聚合列表中的下拉菜单选项添加选中功能
	$(".arg-list-count").on("click",".filed-copy-submenu li",function(event){
		var value = $(this).html();
		var filedId = $(this).parents('.filed-copy').data('id'); 
		$(this).parents('.filed-copy').find('.count-method').html(value);
		updateCountArrItem(filedId,value,countFiledArr);
		rendTable();
	})

	//显示数据最新更新时间
	$('.main-chart-last .data-info-btn').on('mouseover',function(){
		$(this).next().css({"visibility" : "visible"});
	})
	$('.main-chart-last .data-info-btn').on('mouseout',function(){
		$(this).next().css({"visibility" : "hidden"});
	})

	//为图表区工具栏添加定时刷新数据的功能
	var timer;
	$('.data-refresh i').on('click',function(){
		var refreshFlag = $(this).parent().data('refresh');
		if(refreshFlag){
			$(this).parent().data('refresh',false);
			clearInterval(timer);
		}else{
			$(this).parent().data('refresh',true);
			timer = setInterval(rendTable,60000);
		}
	})
	
	//添加对比与移除对比功能
	var $addComBtn = $('.add-compare'),
		$remComBtn = $('.remove-compare'),
		$addAxisBtn = $('.add-axis'),
		$remAxisBtn = $('.remove-axis');
	$remComBtn.parent().css({"display" : "none"});
	$remAxisBtn.parent().css({"display" : "none"});
	$addComBtn.on('click',function(){
		$remComBtn.parent().css({"display" : "block"});
	});
	$addAxisBtn.on('click',function(){
		$remAxisBtn.parent().css({"display" : "block"});
	});
	$remComBtn.on('click',function(){
		$(this).parent().css({"display" : "none"});
	});
	$remAxisBtn.on('click',function(){
		$(this).parent().css({"display" : "none"});
	})

	//添加字段按钮功能
	var $addFiledBtn = $('.add-filed-btn'),
		$addFiledLayer = $('.add-filed-layer'),
		$addFiledCategory = $('.add-filed-layer p'),
		$mainMiddle = $('.main-middle');
	$addFiledBtn.on('click',function(){
		$addFiledLayer.css({"visibility" : "visible"});
	});
	$addFiledCategory.on('click',function(){
		$addFiledLayer.css({"visibility" : "hidden"});
	});
	$mainMiddle.on('click',function(){
		$addFiledLayer.css({"visibility" : "hidden"});
	}) 

	//筛选区功能
	var $filterArea = $('.main-filter');
	var $filterAreaDefaultShow = $('.main-filter-defaultshow');
	var filterObj = {};
	var filterBaseUrl = 'http://10.23.240.21:8080/index/table/_filter?tops=100&_callback=?&dspfilter=';// 测试环境下的url
	// var filterBaseUrlTest = 'json/test4.json';//本地环境下的url
	var filterArr1 = [];
	//为筛选区定义drop事件,定义筛选区获取图表数据的url
	$filterArea.on('drop',function(event){
		var filterName = event.originalEvent.dataTransfer.getData("text");
		var filterParam;
		var filterCopy = '<li class="filter-copy">\
							<p class="filter-title">' + filterName + '<i class="filter-copy-down" data-show="false"></i><i class="filter-copy-close"></i></p>\
							<ul class="filter-list" data-name=' +"'"+ filterName + "'"+'>\
							</ul>\
						</li>';
		$filterAreaDefaultShow.css({"display" : "none"});
		if(!(filterObj.hasOwnProperty(filterName))){
			$(this).children('.main-filter-class').append(filterCopy);
			$('.filter-list').each(function(index,elem){
	            		if($(this).data('name') == filterName){
	            			filterParam = $(this).data('name');
	            		}
	            	});
			var filterItemUrl = filterBaseUrl + filterParam;// 为测试环境下的url添加参数
			$.ajax({
				method: 'get',
	            // url: filterBaseUrlTest,//本地环境
	            url: filterItemUrl,
	            dataType: "jsonp",
	            success: function(data){
	            	var dataResult = data.result.data;
	            	if(!(dataResult == null)){
	            		for(var i = 0;i < dataResult.length;i++){
	            			filterArr1.push('<li><span class="filter-list-item">' + dataResult[i].Id + '</span><span>(' + dataResult[i].Score + ')</span><i data-show="false" class="filter-list-nselected"></i></li>');
	            		}
	            		var ofilterList = filterArr1.join("");
		            	$('.filter-list').each(function(index,elem){
		            		if($(this).data('name') == filterName){
		            			// $(this).append(filterListSearch);
		            			$(this).append(ofilterList);
		            		}
		            	});
		            	filterArr1 = [];
	            	}else{
	            		alert("数据库不存在该字段！")
	            	}        	
	            },
	            error: function(){
	            	alert("请求失败！");
	            }
			})
			filterObj[filterName] = [];
		}else{
			alert("请勿重复添加该字段！");
		}
	});
	
	// 给筛选区字段的下拉按钮添加点击事件
	$('.main-filter-class').on('click','.filter-title',function(){
		var filterListShow = $(this).children('.filter-copy-down').data('show');
		if(filterListShow){
			$(this).next('.filter-list').css({"display" : "none"});
			$(this).children('.filter-copy-down').data('show',false);
		}else{
			$(this).next('.filter-list').css({"display" : "block"});
			$(this).children('.filter-copy-down').data('show',true);
		}
		
	})
	
	//给筛选区字段添加删除事件
	$('.main-filter-class').on('click','.filter-title>.filter-copy-close',function(){
		var delFilterName = $(this).parent().text();
		$(this).parents('.filter-copy').remove();
		for(var index in filterObj){
			if(index == delFilterName){
				delete filterObj[index];
			}
		}
		rendTable();
	});
	
	//给筛选区段的下拉列表定义添加和撤销功能,添加和撤销时都会发送一次ajax请求
	$('.main-filter-class').on('click','.filter-list>li',function(){
		var filterUrl2 = "http://10.23.240.21:8080/index/table/_filter?tops=100&_callback=?&name=" + dmsFiledArr.join(",") + "&filters=";
		var filterSelected = $(this).children('i').data('show');
		var parentSet = $(this).parents().data('name');
		var subSet = $(this).children('.filter-list-item').html();
		if(filterSelected){
			$(this).children('i').attr('class','filter-list-nselected')
			$(this).children('i').data('show',false);
			if(filterObj[parentSet]){
				deleteItem(subSet,filterObj[parentSet]);
			}
			var finalUrl = connectFilterParam(filterUrl2,filterObj);
			console.log(getCommonUrlParam());
		}else{
			$(this).children('i').attr('class','filter-list-selected');
			$(this).children('i').data('show',true);
			if(filterObj[parentSet]){
				filterObj[parentSet].push(subSet);
			}
			var finalUrl = connectFilterParam(filterUrl2,filterObj);
			console.log(getCommonUrlParam());
		}
		rendTable();
	})
	$filterArea.on('dragover',function(event){
		event.originalEvent.preventDefault();
	})

	//为维度列表添加钻取功能
	var layerArr = [];
	$('.arg-list-dms').on('drop','li',function(event){
		if($(this).index() == 0){
			event.stopPropagation();
			var layerItemName = event.originalEvent.dataTransfer.getData("text");
			var layerItem = '<li>\
			<i class="level-arrow"></i>\
			<span class="layer-item-name">' + layerItemName + '</span>\
			<i class="close-btn"></i>\
			\
			</li>'
			// console.log($(this).find('.filed-name').text())
			$('.main-filed-name>span').text($(this).find('.filed-name').text());
			if(layerArr.indexOf(layerItemName) == -1){
				$('.arg-list-layer ul').append(layerItem);
				layerArr.push(layerItemName);
			}else{
				alert("您已经添加该钻取字段！");
			}
			$('.arg-list-layer').css({"display" : "block"});
		};
		rendTable();
	})

	//图层列表项添加删除功能
	$('.arg-list-layer').on('click','.close-btn',function(){
		event.stopPropagation();
		event.preventDefault();
		var delValue = $(this).prev('span').html();
		deleteItem(delValue,layerArr);
		$(this).parents('li').remove();
		if(layerArr.length == 0){
			$('.arg-list-layer .main-filed-name .close-btn').click();
		}
		rendTable();
	})

	//图层中钻取字段的删除事件
	$('.arg-list-layer .main-filed-name .close-btn').on('click',function(){
		layerArr = [];
		$(this).parents('.main-filed-name').siblings('ul').find('li').remove();
		$('.arg-list-layer').css({"display" : "none"});
		rendTable();
	})

	//为右侧功能栏中图表类型的列表项添加选择事件
	$('.ivu-collapse-content-box i').on('click',function(){
		return false;
	})
	$('.ivu-collapse-content-box .s1').on('click',function(){
		$('.chart-box').css({"display": "block"}).siblings('.echarts-box').css({"display": "none"});
	})
	var option = {
            title: {
                text: '网站用户统计'
            },
            tooltip: {},
            legend: {
                data:['访问量']
            },
            xAxis: {
                data: []
            },
            yAxis: {},
            series: [{
                name: '访问量',
                type: 'bar',
                data: [5, 20]
            }]
        };
	$('.ivu-collapse-content-box .s5').on('click',function(){
		$('.echarts-box').css({"display": "block"}).siblings('.chart-box').css({"display": "none"});
		var myChart = echarts.init(document.getElementsByClassName('echarts-box')[0]);
		option.legend.data = dmsFiledArr;
        myChart.setOption(option);
	})

})