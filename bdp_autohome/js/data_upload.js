//vue代码部分
const state = {
	modal1: false,
	getAnalysisDataUrl: "http://10.168.78.108/bdp_autohome/data_upload_json/analysis.json",
	analysis: []
};
const mutations = {
	openStep1Model: function(state){
		state.modal1 = !state.modal1;
	},
	getAnalysisData: function(state,payload){
		state.analysis = payload;
	},
	getAnalysisResult: function(state,payload){
		var analysisResult = [];
		for(var i=0;i<state.analysis.length;i++){
			if(payload.indexOf(state.analysis[i]['sheet_id']) != -1){
				analysisResult.push(state.analysis[i]);
			}
		}
		state.analysis = analysisResult;
	}
};
const actions = {
	openStep1ModelAction: function(context){
		context.commit('openStep1Model'); 
	},
	getAnalysisDataAction: function(context){
		var payload = [];
		dataUploadApp.$http.get(context.state.getAnalysisDataUrl).then(function(response){
				payload = response.body.result.data;
				context.commit('getAnalysisData',payload);
			},function(response){
				alert("接口请求失败！");
			});
	}
};
const getters = {

};
const store = new Vuex.Store({
	state,
	mutations,
	actions
})
const Index = {
	template: "<div class='component-index'>\
					<header>\
						<h2 class='header-text'>添加数据源</h2>\
					</header>\
					<div class='header-input-container'>\
						<div class='header-input-title'>\
							<p>轻松连接一切 让数据为你所用</p>\
						</div>\
						<div class='input-container'>\
							<i-input icon='search' placeholder='搜索想要接入的数据源'></i-input>\
						</div>\
					</div>\
					<div class='data-upload-body'>\
						<ul class='data-upload-nav clearfix'>\
							<li @click = 'getCategoryList(categoryName.whole)' :data-category = 'categoryName.whole' ref='whole' id='nav-item-active'><span>全部</span></li>\
							<li @click = 'getCategoryList(categoryName.database)' :data-category = 'categoryName.database' ref='database'><span>数据库</span></li>\
							<li @click = 'getCategoryList(categoryName.net_market)' :data-category = 'categoryName.net_market' ref='net_market'><span>网络营销</span></li>\
							<li @click = 'getCategoryList(categoryName.online_service)' :data-category = 'categoryName.online_service' ref='online_service'><span>在线客服</span></li>\
							<li @click = 'getCategoryList(categoryName.statistics)' :data-category = 'categoryName.statistics' ref='statistics'><span>数据统计</span></li>\
							<li @click = 'getCategoryList(categoryName.business_manage)' :data-category = 'categoryName.business_manage' ref='business_manage'><span>企业管理</span></li>\
							<li @click = 'getCategoryList(categoryName.public_data)' :data-category = 'categoryName.public_data' ref='public_data'><span>公共数据</span></li>\
							<li @click = 'getCategoryList(categoryName.sync_tools)' :data-category = 'categoryName.sync_tools' ref='sync_tools'><span>同步工具</span></li>\
						</ul>\
						<ul class='data-upload-category clearfix'>\
							<li class='category-item' v-for='(categoryListItem,index) in categoryListArr' :key='index'>\
								<div class='item-img' @mouseenter = 'addBtnShow(index)'>\
									<img :src='categoryListItem.img_src'>\
								</div>\
								<p class='item-name'>{{categoryListItem.category_name}}</p>\
								<div @click='linkToAdd(categoryListItem.category_id)' class='item-btn' @mouseleave = 'addBtnShow(-index)'' v-show='btnShowIndex === index' :key='index'><Icon type='plus-round' size=100></Icon></div>\
							</li>\
						</ul>\
					</div>\
				</div>",
		data: function(){
			return {
				categoryListArr: [],
				categoryName: {
					whole: "whole",
					database: "database",
					net_market: "net_market",
					online_service: "online_service",
					statistics: "statistics",
					business_manage: "business_manage",
					public_data: "public_data",
					sync_tools: "sync_tools"
				},
				getCategoryListUrl: "http://10.168.78.108/bdp_autohome/data_upload_json/",
				btnShowIndex: -1,
				currentCategory: "whole"
				}
			},
		mounted: function(){
			var currentUrl = this.getCategoryListUrl + this.currentCategory + ".json";
			this.$http.get(currentUrl,{"emulateJSON": true}).then(function(response){
				var result = response.body.result.data;
				this.categoryListArr = result;
			},function(response){
				alert("接口请求失败！");
			});
		},
		methods: {
		getCategoryList: function(category){
			this.currentCategory = category;
			var currentUrl = this.getCategoryListUrl + category + ".json";
			this.$http.get(currentUrl,{"emulateJSON": true}).then(function(response){
				var result = response.body.result.data;
				this.categoryListArr = result;
				for(var key in this.$refs){
					// console.log(this.$refs[key].id);
					this.$refs[key].id = "";
				}
				this.$refs[category].id = "nav-item-active";
			},function(response){
				alert("接口请求失败！");
			});
		},
		addBtnShow: function(index){
			this.btnShowIndex = index;
		},
		linkToAdd: function(category_id){
			if(category_id == 'bm_Excel'){
				dataUploadApp.$router.push('/add/step1');
			}else{
				alert('尚未开发！')
			}
		}
	},
}
const Add = {
	template: '<div class="component-add">\
			<header>\
				<router-link to="/"><span class="header-back"><Icon type="arrow-left-a" size=40></Icon></span></router-link>\
				<h2 class="header-text">上传数据</h2>\
			</header>\
			<router-view></router-view>\
		</div>',
	data: function(){
		return {
			
		}
	},
	methods: {

	}
}
const uploadComp = {
	template:  '<Upload\
					multiple\
				    type="drag"\
				    action="//jsonplaceholder.typicode.com/posts/"\
				    :on-success="onSuccess" :headers="header">\
				        <div style="padding: 20px 0">\
				            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>\
				            <p ref="openStep1Model">点击上传文件或者拖拽上传</p>\
				            <p>支持Excel和CSV文件（单个Excel最大100M，CSV最大200M）</p>\
							<p>最多5个文件批量上传，默认识别第一个sheet文件</p>\
				        </div>\
			    </Upload>',
	data (){
		return {
			header: {'Content-Type': 'multipart/form-data','Method': 'POST'}
		}
	},
	methods: {
		onSuccess: function(response, file, fileList){
			// this.$refs.openStep1Model.click();
			// this.$http.get(this.$store.state.getAnalysisDataUrl).then(function(response){
			// 	var result = response.body.result.data;
			// },function(response){
			// 	alert("接口请求失败！");
			// });
			this.$store.dispatch('getAnalysisDataAction');
			this.$store.dispatch('openStep1ModelAction');
		}
	}
}
// const checkboxGroup = {
// 	template: '	<div class="sheet-checkbox">\
// 					<div v-for="(sheetIdItem,index) in sheetId">\
// 						<input type="checkbox" :value="sheetIdItem" ref="checkbox" @change="onChange"/><span>{{sheetIdItem}}</span>\
// 					</div>\
// 				</div>',
// 	data(){
// 		return {
// 			sheetResultId: []
// 		}
// 	},
// 	computed: {
// 		sheetId: function(){
// 			var analysisArr = this.$store.state.analysis;
// 			var sheetIdArr = [];
// 			for(var i = 0;i<analysisArr.length;i++){
// 				sheetIdArr.push(analysisArr[i].sheet_id);
// 			}
// 			this.sheetId = sheetIdArr;
// 			return sheetIdArr;
// 		}
// 	},
// 	methods: {
// 		onChange(){
// 			var resultArr = [];
// 			for(var item in this.$refs.checkbox){
// 				if(this.$refs.checkbox[item].checked){
// 					resultArr.push(this.$refs.checkbox[item].value);
// 				}
// 			}
// 			this.sheetResultId = this.unique(resultArr);
// 		},
// 		unique(arr){
// 			var newArr = [];
// 			for(var i = 0;i<arr.length;i++){
// 				if(newArr.indexOf(arr[i]) == -1){
// 					newArr.push(arr[i])
// 				}
// 			}
// 			return newArr;
// 		}
// 	}
// }
const step1Modal = {
	template: ' <Modal\
			    v-model="modal1"\
			    title="新增数据"\
		        @on-ok="ok"\
		        @on-cancel="cancel">\
		        	<div class="sheet-checkbox">\
						<div v-for="(sheetIdItem,index) in sheetId">\
							<input type="checkbox" :value="sheetIdItem" ref="checkbox" @change="onChange"/><span>{{sheetIdItem}}</span>\
						</div>\
					</div>\
	    		</Modal>',
	methods: {
		ok () {
            this.$store.commit('getAnalysisResult',this.sheetResultId);
            this.$store.dispatch('openStep1ModelAction');
            this.$router.push({path: '/add/step2'});
        },
        cancel () {
            // this.$Message.info('Clicked cancel');
        },
        onChange(){
			var resultArr = [];
			for(var item in this.$refs.checkbox){
				if(this.$refs.checkbox[item].checked){
					resultArr.push(this.$refs.checkbox[item].value);
				}
			}
			this.sheetResultId = this.unique(resultArr);
		},
		unique(arr){
			var newArr = [];
			for(var i = 0;i<arr.length;i++){
				if(newArr.indexOf(arr[i]) == -1){
					newArr.push(arr[i])
				}
			}
			return newArr;
		}
	},
	data: function(){
		return {
			sheetResultId: []
		}
	},
	computed: {
		modal1: function(){
			return this.$store.state.modal1;
		},
		analysis: function(){
			return this.$store.state.analysis;
		},
		sheetId: function(){
			var analysisArr = this.$store.state.analysis;
			var sheetIdArr = [];
			for(var i = 0;i<analysisArr.length;i++){
				sheetIdArr.push(analysisArr[i].sheet_id);
			}
			this.sheetId = sheetIdArr;
			return sheetIdArr;
		}
	}
}
const Step1 = {
	template: '	<div class="cpt-add-body">\
				<div class="step-container">\
					<ul class="step-list clearfix">\
						<li class="step step-first" ref="stepFirst">\
							<i>1</i>\
							<span>上传文件</span>\
						</li>\
						<li class="step step-second" ref="stepSecond">\
							<i>2</i>\
							<span>预览数据</span>\
						</li>\
						<li class="step step-third" ref="stepThird">\
							<i>3</i>\
							<span>工作表设置</span>\
						</li>\
					</ul>\
				</div>\
				<div class="step1-container">\
					<div class="step1-upload-box">\
						<div class="step1-upload-handle">\
							<p class="step1-upload-link">\
							<uploadComp></uploadComp>\
							</p>\
						</div>\
					</div>\
					<div class="step1-table-example">\
						<div class="example-explain">\
							<h3>表格实例</h3>\
							<p>1.请上传有标准行列的一维数据表格。（有合并单元格的数据请处理过后再上传，否则可能出现表头识别有误）</p>\
							<p>2.日期字段需包含年月日（如2016/1/1），或年月日时分秒。（如2016/1/1 00:00:00）</p>\
						</div>\
						<ul class="example-filed-list">\
							<li>第一列</li>\
							<li>第二列</li>\
							<li>第三列</li>\
							<li>第四列</li>\
							<li>第五列</li>\
							<li>第六列</li>\
							<li>第七列</li>\
							<li>第八列</li>\
							<li>第九列</li>\
						</ul>\
						<table class="example-table">\
							<thead>\
								<tr>\
									<th>序号</th>\
									<th>拜访人</th>\
									<th>员工编号</th>\
									<th>部门</th>\
									<th>职位</th>\
									<th>拜访日期</th>\
									<th>拜访时间</th>\
									<th>客户类型</th>\
									<th>进展</th>\
								</tr>\
							</thead>\
							<tbody>\
								<tr>\
									<td>1</td>\
									<td>乔歆然</td>\
									<td>600001</td>\
									<td>销售一部</td>\
									<td>销售总监</td>\
									<td>2016/8/8</td>\
									<td>11:23</td>\
									<td>互联网</td>\
									<td>初次拜访</td>\
								</tr>\
								<tr>\
									<td>2</td>\
									<td>丘慧美</td>\
									<td>600002</td>\
									<td>销售一部</td>\
									<td>销售总监</td>\
									<td>2016/8/8</td>\
									<td>14:43</td>\
									<td>电商</td>\
									<td>初次拜访</td>\
								</tr>\
								<tr>\
									<td>3</td>\
									<td>束怜烟</td>\
									<td>600003</td>\
									<td>销售一部</td>\
									<td>销售总监</td>\
									<td>2016/8/8</td>\
									<td>16:34</td>\
									<td>商贸</td>\
									<td>初次拜访</td>\
								</tr>\
							</tbody>\
						</table>\
						<step1Modal></step1Modal>\
					</div>\
				</div>\
			</div>',
	components: {
		'uploadComp': uploadComp,
		'step1Modal': step1Modal
	},
	data: function(){
		return {

		}
	},
	mounted: function(){
		var stepFirst = this.$refs.stepFirst;
		stepFirst.style.opacity = 1;
	},
	methods: {
		
	}	
}
const Step2 = {
	template: '<div class="cpt-add-body">\
					<div class="step-container">\
						<ul class="step-list clearfix">\
							<li class="step step-first" ref="stepFirst">\
								<i>1</i>\
								<span>上传文件</span>\
							</li>\
							<li class="step step-second" ref="stepSecond">\
								<i>2</i>\
								<span>预览数据</span>\
							</li>\
							<li class="step step-third" ref="stepThird">\
								<i>3</i>\
								<span>工作表设置</span>\
							</li>\
						</ul>\
					</div>\
					<div class="step2-container">\
						<p class="step2-explain1">系统默认将数据类型设置为文本型，如需修改数据类型请切换到工作表中的字段设置功能</p>\
						<ul class="step2-tabmenu">\
							<li class="step2-tab" v-for="(analysisItem,index) in analysis">\
								<div class="tab-content" @click="switchTab(index)">{{analysisItem.sheet_name}}</div>\
							</li>\
						</ul>\
						<div class="step2-table-container">\
							<table class="step2-table">\
								<thead>\
									<tr>\
										<th v-for="currenttheadItem in currentthead">{{currenttheadItem}}</th>\
									</tr>\
								</thead>\
								<tbody>\
									<tr v-for="rowItem in currenttbody">\
										<td v-for="colItem in rowItem">{{colItem}}</td>\
									</tr>\
								</tbody>\
							</table>\
						</div>\
						<div class="step2-container-footer">\
							<router-link to="/add/step3">\
								<span class="next-step">下一步</span>\
							</router-link>\
							<router-link to="/add/step1">\
								<span class="last-step">上一步</span>\
							</router-link>\
						</div>\
					</div>\
				</div>',
	mounted: function(){
		var stepSecond = this.$refs.stepSecond;
		stepSecond.style.opacity = 1;
	},
	data(){
		return {
			currentSheetContent: {},
			currentthead: [],
			currenttbody: {}
		}
	},
	computed: {
		analysis: function(){
			var analysis = this.$store.state.analysis;
			this.currentSheetContent = analysis[0];
			this.currentthead = this.currentSheetContent.sheet_content.thead;
			this.currenttbody = this.currentSheetContent.sheet_content.tbody;
			return analysis;
		}
	},
	methods: {
		switchTab(index){
			this.currentSheetContent = this.analysis[index];
			this.currentthead = this.analysis[index].sheet_content.thead;
			this.currenttbody = this.analysis[index].sheet_content.tbody;
		}
	}
}
const Step3 = {
	template: '	<div class="cpt-add-body">\
					<div class="step-container">\
						<ul class="step-list clearfix">\
							<li class="step step-first" ref="stepFirst">\
								<i>1</i>\
								<span>上传文件</span>\
							<li class="step step-second" ref="stepSecond">\
								<i>2</i>\
								<span>预览数据</span>\
							</li>\
							<li class="step step-third" ref="stepThird">\
								<i>3</i>\
								<span>工作表设置</span>\
							</li>\
						</ul>\
					</div>\
					<div class="step3-container">\
						<div class="step3-left-content">\
							<p class="step3-title">工作表</p>\
							<ul class="step3-sheet-list">\
								<li class="step3-sheet-item" @click="test"><i></i><span>sheet1</span></li>\
							</ul>\
						</div>\
						<div class="step3-right-content">\
							<div class="step3-right-content-inner">\
								<div class="sheet-name clearfix">\
									<div class="sheet-name-title">工作表</div>\
									<div class="sheet-name-content">\
										<i-input></i-input>\
									</div>\
								</div>\
								<div class="sheet-location clearfix">\
									<div class="sheet-location-title">文件夹</div>\
									<div class="sheet-location-content">\
										<span class="sheet-location-result">根目录</span>\
										<a class="sheet-location-change">修改</a>\
										<a class="sheet-location-all">全部应用</a>\
									</div>\
								</div>\
								<div class="sheet-tag clearfix">\
									<div class="sheet-tag-title">分类标签</div>\
									<div class="sheet-tag-content">\
										<i-input></i-input>\
									</div>\
								</div>\
								<div class="sheet-remark clearfix">\
									<div class="sheet-remark-title">备注</div>\
									<div class="sheet-remark-content">\
										<i-input type="textarea" :rows="4"></i-input>\
									</div>\
								</div>\
							</div>\
						</div>\
						<div class="step3-container-footer">\
							<router-link to="">\
								<span class="next-step">下一步</span>\
							</router-link>\
							<router-link to="/add/step2">\
								<span class="last-step">上一步</span>\
							</router-link>\
						</div>\
					</div>\
				</div>	',
	mounted: function(){
		var stepThird = this.$refs.stepThird;
		stepThird.style.opacity = 1;
	},
	data(){
		return {
			currentAnalysis: [],
			currentSheetContent: {},
		}
	},
	computed: {
		analysis: function(){
			var analysis = this.$store.state.analysis;
			for(var i=0;i<analysis.length;i++){
				for(var key in analysis[i]){
					if(key == "sheet_content"){
						delete analysis[i][key];
					}
				}
				this.currentAnalysis.push(analysis[i]);
			}
			return analysis;
		}
	},
	methods: {
		test: function(){
			console.log(this.analysis);
			console.log(this.currentAnalysis);
		}
	}
}
const routes = [
  { path: '/', component: Index },
  { 
  	path: '/add',
  	component: Add,
  	children: [
  		{path: '/add/step1', component: Step1},
  		{path: '/add/step2', component: Step2},
  		{path: '/add/step3', component: Step3}
  	]
  }
]

const router = new VueRouter({
  routes: routes
})

const dataUploadApp = new Vue({
	el: ".data-upload",
	data: {

	},
	store,
	methods: {
		
	},
	components: {
		'index': Index,
		'add': Add
	},
	router
}).$mount('.data-upload');