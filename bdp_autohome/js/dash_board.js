//vue代码部分
var dashBoardApp = new Vue({
	el: ".dial-body",
	data: {
		folderUrl: "http://10.23.240.21:8080/_indexs?filter=",
		folderArr: [],
		tableUrl: "http://10.23.240.21:8080/",
		tableObj: {},
		layerAddTableShow: false,
		layerAddFolderShow:false,
		layerAddDailShow: false,
		dialClass: "普通仪表盘"
	},
	methods: {
		addChart: function(){
			this.layerAddTableShow = !this.layerAddTableShow;
		},
		createfolder: function(){
			this.layerAddFolderShow = !this.layerAddFolderShow;
		},
		createdail: function(){
			this.layerAddDailShow = !this.layerAddDailShow;
		}
	},
	mounted: function(){
		this.$http.jsonp(this.folderUrl,{params: {},jsonp: "_callback"}).then(function(response){
			// 响应成功回调
		    this.folderArr = response.body.result.data;
		    if(this.folderArr[0]){
		    		for(var i = 0;i < this.folderArr.length;i++){
		    			var tableUrl1 = this.tableUrl + this.folderArr[i] + "/_tables?filter=";
		    			var _this = this;
		    			var index = i;
		    			this.$http.jsonp(tableUrl1,{params: {},jsonp: "_callback"}).then(function(response){
							// 响应成功回调
						    _this.$set(_this.$data.tableObj,_this.folderArr[index],response.body.result.data);//方案一
						    // _this.$data.tableObj[_this.folderArr[index]] = response.body.result.data;//方案二
						    // _this.$data.tableObj = Object.assign({}, _this.$data.tableObj);
						}, function(response){
						    // 响应错误回调
						    alert("接口请求失败！");
						});
		    		}
			}
		}, function(response){
		    // 响应错误回调
		    alert("接口请求失败！");
		});
	}
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
				window.location.href = "http://192.168.0.105/bdp_autohome/dash_board.html";
			}else if($tabName == "chart-edit"){
				$('.add-chart>span').trigger('click');
			}else if($tabName == "work-sheet"){
				window.location.href = "http://192.168.0.105/bdp_autohome/work_sheet.html"
			}else if($tabName == "data-source"){
				window.location.href = "http://10.168.78.108/bdp_autohome/data_source.html"
			}
		}
		
	})

	//为左侧仪表盘中的按钮对应的弹层添加显示隐藏事件
	function btnChooseLayer(btn){
		$('.btn-chooselayer-container>li').each(function(index,elem){
			var btnType = $(this).data('btn');
			if(btnType == btn){
				$(this).css({"display": "block"}).siblings().css({"display": "none"});
			}
		})
	};


	//为左侧仪表盘中的按钮添加点击显示/隐藏事件
	$('.page-title-btn-container').on('click','.page-title-btn',function(){
		var btnType = $(this).data('btn');
		btnChooseLayer(btnType);
	})
	$('.dial-right-container').on('click',function(){
		$('.btn-chooselayer-container>li').each(function(index,elem){
			$(this).css({"display": "none"});
		})
	});

	//为左侧仪表盘按钮区的more-btn添加选择事件
	$('.more-close').on('click',function(){
		if($('.mainmenu-dialmenu .mainmenu-name').data('show')){
			$('.mainmenu-dialmenu .mainmenu-name').trigger('click');
		}
		$(this).parents('.more-chooselayer').css({"display": "none"});
	});
	$('.more-open').on('click',function(){
		if(!$('.mainmenu-dialmenu .mainmenu-name').data('show')){
			$('.mainmenu-dialmenu .mainmenu-name').trigger('click');
		}
		$(this).parents('.more-chooselayer').css({"display": "none"});
	});

	//为左侧仪表盘按钮区的more-btn添加选择事件
	$('.add-chooselayer-item').on('click',function(){
		$(this).parents('.add-chooselayer').css({"display": "none"});
	})

	//为左侧仪表盘列表项中的按钮添加点击事件
	$('.mainmenu-dialmenu').on('click','.dialmenu-item-more',function(){
		var iShow = $(this).siblings('.dialmenu-item-layer-container').data('show');
		if(iShow){
			$(this).siblings('.dialmenu-item-layer-container').data('show',false);
			$(this).siblings('.dialmenu-item-layer-container').data('show');
			$(this).siblings('.dialmenu-item-layer-container').css({"display": "none"});
		}else{
			$(this).siblings('.dialmenu-item-layer-container').data('show',true);
			$(this).siblings('.dialmenu-item-layer-container').data('show');
			$(this).siblings('.dialmenu-item-layer-container').css({"display": "block"});
		} 
	});

	//为左侧仪表盘中的folder添加点击事件
	$('.mainmenu-dialmenu').on('click','.mainmenu-name',function(){
		var iShow = $(this).data('show');
		if(iShow){
			$(this).data('show',false);
			$(this).siblings().css({"display": "none"});
		}else{
			$(this).data('show',true);
			$(this).siblings().css({"display": "block"});
		}
	});
	//为左侧仪表盘中的具体表的跳转页面封装函数
	function jumpToEdit(dbName,tbName){
		window.location.href = "http://10.168.78.108/bdp_autohome/index.html?dbName=" + dbName + "&tbName=" + tbName;
	}

	//为左侧仪表盘中的具体表添加跳转页面事件
	$('.mainmenu-dialmenu').on('click','.dialmenu-item>span',function(){
		var dbName = $(this).parents('.mainmenu-index').find('.mainmenu-name span').html();
		var tbName = $(this).find('span').html();
		jumpToEdit(dbName,tbName)
		alert("切换数据！")
	})

	//为添加图表的弹出层中的图表类型选项添加点击事件
	$('.select-table-class').on('click','li',function(){
		if($(this).data('show') == false){
			$(this).siblings().css({"opacity": 0.4,"border": "1px solid #dddee1"}).data('show',false);
			$(this).css({"opacity": 1,"border": "1px solid rgb(81, 130, 228)"});
			$(this).data('show',true);
		}else{
			$(this).css({"opacity": 0.4,"border": "1px solid #dddee1"});
			$(this).data('show',false);
		}
	})

	//为添加图表的弹出层中的数据库添加下拉功能
	$('.item-index').on('click','.item-index-folder',function(){
		var folderItemShow = $(this).data('show');
		if(folderItemShow){
			$(this).siblings('.item-table').css({"display": "none"});
			$(this).data('show',false);
		}else{
			$(this).siblings('.item-table').css({"display": "block"});
			$(this).data('show',true);
		}
	})

	//为添加图表的弹出层中的数据表选项添加点击事件
	$('.item-index').on('click','.select-table-li',function(){
		var tableItemShow = $(this).data('show');
		if(tableItemShow){
			$(this).children('i').attr('class','item-table-nselected');
			$(this).data('show',false);
		}else{
			$(this).siblings().find('i').attr('class','item-table-nselected');
			$(this).children('i').attr('class','item-table-selected');
			$(this).data('show',true);
		}
	})

	//为添加图表的弹出层中的确认按钮添加跳转页面事件
	$('.layer-btn-com').on('click',function(){
		var $tbItem = $(this).parent().siblings('.layer-table-body').find('.select-table-li');
		var dbName;
		var tbName;
		$tbItem.each(function(index,elem){
			if($(this).data('show')){
				dbName = $(this).parent().siblings('.item-index-folder').children('span').html();
				tbName = $(this).children('span').html();
				jumpToEdit(dbName,tbName);
			}else{
				alert("请选择数据表！")
			}
		});
	})

	//图表展示区域的图表展示效果以及拖拽交互

	//拖拽元素时，判断拖拽元素是否与其他元素发生碰撞；当拖拽元素与多个元素发生碰撞时，判断拖拽元素距离哪个元素最近；
	function NearSet(){
		//NearSet构造函数
	};
	NearSet.prototype = {

		//判断元素是否发生碰撞的方法
		crashTest: function(obj1,obj2){
			var t1 = obj1.offsetTop,
				l1 = obj1.offsetLeft,
				b1 = obj1.offsetTop + obj1.offsetHeight,
				r1 = obj1.offsetLeft + obj1.offsetWidth,
				t2 = obj2.offsetTop,
				l2 = obj2.offsetLeft,
				b2 = obj2.offsetTop + obj2.offsetHeight,
				r2 = obj2.offsetLeft + obj2.offsetWidth;

			if(b1<t2 || b2<t1 || r1<l2 || r2<l1){
				return false;
			}else{
				return true;
			}
		},

		//计算元素中心点之间距离的方法
		getDistance: function(obj1,obj2){
			var x1 = obj1.offsetLeft + (obj1.offsetWidth/2),
				y1 = obj1.offsetTop + (obj1.offsetHeight/2),
				x2 = obj2.offsetLeft + (obj2.offsetWidth/2),
				y2 = obj2.offsetTop + (obj2.offsetHeight/2),
				x = x2 - x1,
				y = y2 - y1;
			return Math.sqrt(x*x + y*y);
		},

		//得到相碰撞的元素中距离被拖拽元素最近的元素
		getNearest: function(obj,list){
			var list = list || [],
				minDis = 999999,
				minDisIdx = -1;
			for(var i = 0;i < list.length;i++){
				if(obj != list[i]){
					if(this.crashTest(obj,list[i])){
						var dis = this.getDistance(obj,list[i]);
						if(dis < minDis){
							minDis = dis;
							minDisIdx = i;
						}
					}
				}
			}
			if(minDisIdx == -1){
				return null;
			}else{
				return list[minDisIdx];
			}
		}
	}

	//释放拖拽元素后移动的效果
	function Move(){
		//Move构造函数
	}
	Move.prototype = {
		//获取拖拽元素被释放时的所有css属性值
		getStyle: function(obj,prop){
			if(obj.currentStyle){
				return obj.currentStyle[prop];
			}else{
				return getComputedStyle(obj,null)[prop];
			}
		},

		//释放拖拽元素后对元素运动状态的定义
		startMove: function(obj,json,callback){
			var getStyle = this.getStyle;
			clearInterval(obj.timer);
			obj.timer = setInterval(function(){
				var bStop = true;
				obj.style.zIndex = 3;//9999
				for(var prop in json){
					//获取当前的属性值
					var iCur = 0;
					iCur = parseInt(getStyle(obj,prop));
					
					//计算拖拽元素移动的速度
					var iSpeed = (json[prop] - iCur)/8;
					iSpeed = iSpeed>0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);

					//检测拖拽的元素是否停止运动
					if(iCur != json[prop]){
						bStop = false;
					}
					obj.style[prop] = iCur + iSpeed + "px";
				}

				if(bStop){
					clearInterval(obj.timer);
					obj.style.zIndex = 2;//999
					if(callback){
						callback();
					}
				}
			},30)
		}
	}

	//拖拽构造函数
	function Drag(element){
		var list = document.querySelector('#dial-box-content').children,
			Pos = [],
			len = list.length,
			index = [];

		//记录元素的初始位置
		for(var i = 0;i<len;i++){
			Pos[i] = {'left': list[i].offsetLeft,'top': list[i].offsetTop};
		}
		//将元素绝对定位
		for(var i = 0;i<len;i++){
			list[i].style.position = 'absolute';
			list[i].style.left = Pos[i].left + 'px';
			list[i].style.top = Pos[i].top + 'px';
		}
		//存储所有元素以及它们的初始位置
		this.Pos = Pos;
		this.elems = list;
		this.elem = element;
		this.move();
	}

	//拖拽构造函数原型
	Drag.prototype = {
		constructor: Drag,
		//阻止默认行为，阻止冒泡
		stopPrevent: function(e){
			var e = e || window.event;
			if(e.preventDefault){
				e.preventDefault();
				e.stopPropagation();
			}else{
				e.returnValue = false;
				e.cancelBubble = true;
			}
		},

		//获取当前元素的索引值
		curIndex: function(obj,arr){
			var arr = arr || [];
			for(var i = 0;i<arr.length;i++){
				if(obj == arr[i]){
					return i;
				}
			}
		},

		move: function(){
			var element = this.elem;
			var	lists = this.elems;
			var	nearElement;
			Pos = this.Pos;
			var	stopPrevent = this.stopPrevent;
			var	curIndex = this.curIndex;
			var	Moveto = new Move();
			var	startMove = Moveto.startMove;
			element.style.zIndex = '2';//999
			element.style.cursor = 'pointer';

			// var element = this.elem,
			// 	lists = this.elems,
			// 	stopPrevent = this.stopPrevent,
			// 	nearElement;
			// 	Pos = this.Pos,				
			// 	curIndex = this.curIndex,
			// 	Moveto = new Move(),
			// 	startMove = Moveto.startMove;
			// element.style.zIndex = '999';
			// element.style.cursor = 'move';

			//鼠标按下当前元素
			element.onmousedown = function(e){
				var e = e || window.event,
					offleft = element.offsetLeft,
					offtop =  element.offsetTop,
					//兼容性问题,ie支持event.x和event.y，而其他浏览器支持event.pageX和event.pageY
					mousex = e.x ? e.x : e.pageX,
					mousey = e.y ? e.y : e.pageY;
					element.style.zIndex = 3;//9999
					//阻止默认行为，阻止事件冒泡
					stopPrevent(e);
					document.onmousemove = function(e){
						var e = e || window.event,
							movex = e.x ? e.x : e.pageX,
							movey = e.y ? e.y : e.pageY;
						stopPrevent(e);
						//元素移动的距离
						var positionx = movex - mousex + offleft,
							positiony = movey - mousey + offtop;
						element.style.left = positionx + "px";
						element.style.top = positiony + "px";
						var near = new NearSet();
							nearElement = near.getNearest(element,lists);
						for(var i = 0;i<lists.length;i++){
							lists[i].className = "";
						}
						if(nearElement){
							nearElement.className = "active";
						}
					}
					document.onmouseup = function(){
						document.onmouseup = null;
						document.onmousemove = null;
						var moveIndex = curIndex(element,lists),
							activeIndex = curIndex(nearElement,lists);
						if(nearElement){
							nearElement.className = "";
							startMove.apply(Moveto,[element,Pos[activeIndex]]);
							startMove.call(Moveto,nearElement,Pos[moveIndex]);

							//交换Pos数组中存储的位置数据
							var offsetInfo = Pos[activeIndex],
								offsetInfo1 = Pos[moveIndex];
							Pos[activeIndex] = offsetInfo1;
							Pos[moveIndex] = offsetInfo;
						}else{
							startMove.call(Moveto,element,Pos[moveIndex]);
						}
						return false;
					}
			}
		}
	}

	var dragContainer = document.querySelector('#dial-box-content');
	for(var i = 0;i<dragContainer.children.length;i++){
		new Drag(dragContainer.children[i]);
	}
})