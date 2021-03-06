                        //darg拖拽
                        (function(window,undefined){
                                                        
                                //判断最靠近的构造函数
                                function Nearset(){
                                
                                }
                                //Nearset构造函数
                                Nearset.prototype={
                                        
                                        //判断是否碰撞函数
                                        crashTest:function(obj1,obj2){
                                                                var l1=obj1.offsetLeft,
                                                                //obj.offsetWidth 指 obj 控件自身的绝对宽度，不包括因 overflow 而未显示的部分，也就是其实际占据的宽度，整型，单位像素，也可以用clientWidth，clientHeight
                                                                        r1=obj1.offsetLeft+obj1.offsetWidth,
                                                                        t1=obj1.offsetTop,
                                                                        b1=obj1.offsetTop+obj1.offsetHeight,
                                                                        
                                                                        l2=obj2.offsetLeft,
                                                                        r2=obj2.offsetLeft+obj2.offsetWidth,
                                                                        t2=obj2.offsetTop,
                                                                        b2=obj2.offsetTop+obj2.offsetHeight;
                                                                
                                                                //九宫格原理，上下左右边都不交叉则没有碰撞        
                                                                if(r1<l2 || l1>r2 || t1>b2 || b1<t2){
                                                                        return false;
                                                                }else{
                                                                        return true;
                                                                }                                                                                                                        
                                        },
                                        
                                        //取得两点（元素的中心点）之间的距离
                                        getDis:function(obj1,obj2){
                                                        //获取元素原心所在的坐标
                                                        var  obj1left=obj1.offsetLeft+(obj1.offsetWidth/2),
                                                                 obj1top=obj1.offsetTop+(obj1.offsetHeight/2),
                                                                 obj2left=obj2.offsetLeft+(obj2.offsetWidth/2),
                                                                 obj2top=obj2.offsetTop+(obj2.offsetHeight/2),
                                                                 x=obj2left-obj1left,
                                                                 y=obj2top-obj1top;
                                                        //圆心垂直距离        
                                                                return Math.sqrt(x*x+y*y);                                        
                                        },
                                        
                                        //取得相碰撞元素中，离自己最近的元素 obj为移动的元素，list为比较的元素                
                                        findNearset:function(obj,list){
                                                var list=list || [],
                                                        min=999999,
                                                        minIndex=-1;
                                                
                                                for(var i=0,len=list.length;i<len;i++){
                                                        if(obj!=list[i]){
                                                                if(this.crashTest(obj,list[i])){
                                                                        var dis=this.getDis(obj,list[i]);
                                                                        if(dis<min){
                                                                                min=dis;
                                                                                minIndex=i;
                                                                        }
                                                                }
                                                        }
                                                }
                                                
                                                if(-1==minIndex)return null;
                                                return list[minIndex]                                        
                                        }
                                }
                                
                                
                                
                                
                                
                                //移动构造函数
                                function Move(){
                                
                                }
                                Move.prototype={
                                        //获取当前元素所有最终使用的CSS属性值 ，兼容的写法，火狐支持getComputedStyle
                                        getStyle:function(obj, prop){
                                                                if(obj.currentStyle){
                                                                                //或者 obj.currentStyle.width
                                                                                return obj.currentStyle[prop];
                                                                }
                                                                else{
                                                                                //或者 getComputedStyle(obj,null).width   第二个参数是伪类如getComputedStyle(dom,':after')，null表示没有伪类
                                                                                return getComputedStyle(obj, null)[prop];
                                                                }                                                
                                                                                                
                                        },
                                        startMove:function(obj, json, callback){
                                                        //奇怪为什么有时候原型里面用this，指定不了对象
                                                        var getStyle=this.getStyle;
                                                        clearInterval(obj.timer);
                                                        
                                                        //这里的obj.timer,是不同的循环，不能一样，不然会有bug，不能前面加var声明,不然会报obj.timer没有这个属性
                                                        obj.timer=setInterval(function (){
                                                                        //这一次运动就结束了——所有的值都到达了
                                                                        var bStop=true;  
                                                                        obj.style.zIndex=9999;
                                                                        for(var prop in json){
                                                                                        //1.取当前的值
                                                                                        var iCur=0;
                                                                                        
                                                                                        iCur=parseInt(getStyle(obj, prop));
                                                                                        
                                                                                        //2.算速度
                                                                                        var iSpeed=(json[prop]-iCur)/8;
                                                                                        iSpeed=iSpeed>0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
                                                                                        
                                                                                        //3.检测停止  只有left,top两个属性值都相等时才会停止
                                                                                        if(iCur!=json[prop]){
                                                                                                        bStop=false;
                                                                                        }
                                                                                        
                                                                                        obj.style[prop]=iCur+iSpeed+'px';
                                                                        }
                                                                        
                                                                        if(bStop){
                                                                                        clearInterval(obj.timer);
                                                                                        obj.style.zIndex=999;
                                                                                        //停止时执行回调函数
                                                                                        if(callback){
                                                                                                        callback();
                                                                                        }
                                                                        }
                                                        }, 30)                                        
                                        }
                                }
                                
                                
                                
                                
                                
                                //拖拽构造函数
                                function darg(element){
                                
                                        //初始化元素，让其相对于父元素确定位置
                                        var list=document.getElementById('imgWrap').children,
                                                Pos=[],len=list.length,index=[];
                                
                                        for(i=0;i<len;i++){
                                                Pos[i]={'left':list[i].offsetLeft,'top':list[i].offsetTop};
                                        }
                                        for(i=0;i<len;i++){
                                                //每个元素绝对定位，加上left、top值
                                                list[i].style.position='absolute';
                                                list[i].style.left=Pos[i].left+'px',
                                                list[i].style.top=Pos[i].top+'px';
                                        }        
                                        //存储所有移动元素的样式left，top值
                                        this.Pos=Pos,
                                        this.elems=list,
                                        this.elem=element,
                                        this.move();
                                }
                                
                                //拖拽构造原型
                                darg.prototype={
                                        constructor:darg,
                                        //阻止默认行为，阻止冒泡        
                                        stopPrevent:function(e){
                                                var e=e || window.event;
                                                if(e.preventDefault){
                                                   e.preventDefault(),
                                                   e.stopPropagation();
                                                }else{
                                                        e.returnValue=false,
                                                        e.cancelBubble=true;                                                        
                                                }        
                                        },
                                        //获取当前元素索引值
                                        curIndex:function(obj,arr){
                                                var arr=arr || [];
                                                for(var i=arr.length;i--;){
                                                        if(obj==arr[i]){
                                                                return i;
                                                        }
                                                }
                                        },
                                        move:function(){
                                        
                                                //鼠标按下当前元素
                                                var element=this.elem,
                                                        lists=this.elems,
                                                        stopPrevent=this.stopPrevent,
                                                        nearElement;
                                                        //console.log(lists);
                                                        element.style.zIndex='999',
                                                        element.style.cursor='move',
                                                        Pos=this.Pos;
                                                        curIndex=this.curIndex,
                                                        //实例构造函数获取对象方法                                                                                                        
                                                        Moveto=new Move(),
                                                        startMove=Moveto.startMove;
                                                        
                                                element.onmousedown=function(e){
                                                        var e=e || window.event,
                                                                offleft=element.offsetLeft,
                                                                offtop=element.offsetTop,                                                                        
                                                                //ie支持event.x event.y,其他浏览器支持event.pageX,event.pageY
                                                                mousex=e.x ? e.x : e.pageX,
                                                                mousey=e.y ? e.y :e.pageY;
                                                                element.style.zIndex=9999;
                                                        //阻止默认行为，阻止冒泡        
                                                    stopPrevent(e);                                                        
                                                                document.onmousemove=function(e){
                                                                        
                                                                        var e=e || window.event,
                                                                                movex=e.x ? e.x : e.pageX,
                                                                                movey=e.y ? e.y :e.pageY;
                                        stopPrevent(e);                                                                                
                                                                        //元素移动的距离
                                                                        var positionx=movex-mousex+offleft,
                                                                                positiony=movey-mousey+offtop;
                                                                        element.style.left=positionx+'px',
                                                                        element.style.top=positiony+'px';
                                                                        var near=new Nearset();
                                                                        nearElement=near.findNearset(element,lists);
                                                                        
                                                                        for(var i=lists.length;i--;){
                                                                                lists[i].className='';
                                                                        }
                                                                        if(nearElement)nearElement.className='active';                                                                                                                                        
                                                                }
                                                                document.onmouseup=function(){
                                                                        document.onmouseup=null,
                                                                        document.onmousemove=null;        
                                                                        var moveIndex=curIndex(element,lists),
                                                                                activeIndex=curIndex(nearElement,lists);
                                                                        if(nearElement){
                                                                                nearElement.className='';
                                                                                        //交换移动的index索引，由于直接构造函数里面的用this引用对象，所以会导致这里找不到，通过call或者apply来指引对象
                                                                                        startMove.apply(Moveto,[element,Pos[activeIndex]]);
                                                                                        startMove.call(Moveto,nearElement,Pos[moveIndex]);
                                                                                        
                                                                                        //交换Pos数组存储的位置信息
                                                                                        var offsetInfo=Pos[activeIndex],
                                                                                                offsetInfo1=Pos[moveIndex]
                                                                                                Pos[activeIndex]=offsetInfo1,
                                                                                                Pos[moveIndex]=offsetInfo;
                                                                                
                                                                        }else{
                                                                                startMove.call(Moveto,element,Pos[moveIndex]);
                                                                                
                                                                        }        
                                                
                                                                        return false;
                                                                }
                                                                                        
                                                }
                                                                                                                                        
                                        }
                                }                                
                                
                                window.darg=darg;
                                window.Move=Move;
                                window.Nearset=Nearset;

                        })(window)
                        
                        
                        //设置索引拖拽元素执行
                        for(var j=0,leng=$('imgWrap').children.length;j<leng;j++){
                                new darg($('imgWrap').children[j]);
                        }        

                        
                        function $(id){
                                return (!id) ? null : document.getElementById(id);
                        }                        