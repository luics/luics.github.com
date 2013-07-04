/**
 * 天猫专辑跨终端
 *
 * @author luics (guidao)
 * @version 1.0.0
 * @date 5/26/13 3:00 PM
 */
var __IMPORT = [
    'xtemplate',
    'flipsnap',
    'hammer',
	'cookie',
    'tmallpromotion/util'
].join(',');

KISSY.use(__IMPORT, function(S, Xtpl, Flipsnap, Hammer, Cookie, U) {
    S.Config.debug = true;
	
    var inited = false;//全局保留参数
	
	//全局环境参数的设定
	var phoneGlobal = {
		width:320,
		listId:1,
		goTheWay:true, //true 表示点击左边
		height:window.innerHeight,
		transformMark:false, //缓存小猫缩小状态的位置 false 能代表是关闭的状态
		toggleNavMark:false //缓存下面导航栏的显隐 true表示隐藏状态
	}

    function init() {
        //var qs = U.unparam(location.href);
		qs = getListId();
        go(qs ? qs : 1);
    }
	
	//从hash里面取listId
	function getListId(){
		var _listId = (location.hash.split('/')[0].split('!')[1])*1;
		
		_listId = _listId?_listId:1;
		
		_listId = U.unparam(location.href) && U.unparam(location.href).id || _listId;
		
		return _listId;
	}
	
	//从hash里面取itemId
	function getItemId(){
		var _itemId = (location.hash.split('/')[1])*1;
		
		_itemId = _itemId?_itemId:0;
		
		return _itemId;
	}

    function go(id) {
        S.ajax({
            type: 'get',
            dataType: 'json',
            url: 'data/sub.php',
            timeout: 3,
            data: {
                id: id
            },
            success: function(data) {
                if (!data.success) {
                    return;
                }

                var model = data.model;
                U.log('sub subcess', model);

                var platform = U.platform;
                var isPhone = platform.iphone || platform.android;
                var isPhone = true;
                if (isPhone) {
                    renderPhone(model);
					//TODO:添加一个浏览器的resize()和PC渲染，主要用于演示，正式使用的话剔除之
					renderPc(model);
					resizePhone();
                } else {
                    renderPc(model);
                }
            },
            error: function(textStatus) {
                U.log(textStatus);
            }
        });
    }
	

    /**
     * 手机界面构造
     *
     * @param {Object} model
     * @param {Object} model.list
     * @param {Array} model.list.data
     */
    function renderPhone(model) {
		
		//入口函数
		function phoneInit(){
			
			//DOM结构构造
			domRender();
			
			//通用事件绑定
			activeBind();
			
			//回显函数
			review();
			
			//判断是否被加载过
			inited = true;
		}
		
		var ROOT_TPL = new Xtpl([
			'<div id="J_PhoneContent" class="phone-content">',
			'  <div id="J_PhoneDetail" class="phone-detail"></div>',
			'  <ul id="J_PhoneList" class="phone-list"><li class="list-more" id="J_ListMore">更多活动</li></ul>',
			'  <div id="J_Guide" class="guide"></div>',
			'  <div class="subject-loading" id="J_LadingBox">',
			'    <div class="subject-loading-bg"></div>' ,
			'    <div class="subject-loading-content">' ,
			'      <div class="subject-loading-anim"></div>' ,
			'    </div>' ,
			'  </div>',
			'</div>'
			].join('')), //根结点所有基于这个DOM构造
			
			 LIST_TPL = new Xtpl([
			'<div class="subject-content" style="width:{{contentWidth}}px;">',
			'  {{#each data}}',
			'  <div class="subject-item J_DblclickTo" data-title="{{skuName}}" data-price="{{skuPrice}}" data-link="http://a.m.tmall.com/i{{{itemId}}}.htm">',
			'    <img data-view="{{xindex}}" alt="{{skuName}}" src="{{{skuImgUrl}}}" style="width:{{../winWidth}}px;" />', 
			'  </div>',
			'  {{/each}}',
			'</div>',
			'<div class="subject-nav">',
			'  <div class="subject-nav-viewport">',
			'    <div class="subject-nav-content" style="width:{{navContentWidth}}px;">',// 
			'      <div class="subject-nav-item"><div class="subject-nav-itembox list-prev" id="J_ListPrev"></div></div>',
			'    {{#each data}}',
			'      <div class="subject-nav-item">',
			'        <div class="subject-nav-itembox"><img data-view="{{xindex}}" alt="{{skuName}}" src="{{{skuImgUrl}}}"' + // 
				' style="width:100%;" /></div>',
			'      </div>',
			'    {{/each}}',
			'      <div class="subject-nav-item"><div class="subject-nav-itembox list-next" id="J_ListNext"></div></div>',
			'    </div>',
			'  </div>',
			'</div>',
			'<div class="subject-topnav" id="J_TopNav">',
			'  <div class="subject-nav-back" id="J_ShowList"></div>',
			'  <div class="subject-nav-share" id="J_IShare"><div class="subject-nav-share-demo" id="J_IShareDemo"></div></div>',
			'  <div class="subject-nav-fav" id="J_SubjectFav"><i></i></div>',
			'</div>',
			'<div class="assistivetouch-box" id="J_ATBox">',
			'  <div class="at-catbox" id="J_Cat"><div class="at-cat" id="J_Cat"></div></div>',
			'  <div class="at-dot" id="J_Dot"></div>',
			'  <div class="at-menu">',
			'    <div class="at-item-title" id="J_ItemTitle"></div>',
			'    <div class="at-item-price" id="J_ItemPrice"></div>',
			'    <div class="at-item-detail" id="J_ToDetail">查看详情</div>',
			'  </div>',
			'</div>'
			].join('')), //detail结点内填充的数据
			
			GUIDE_TPL = new Xtpl([
				'<ul class="guide-content" style="width:1600px;" id="J_GuideOn">',
				'	<li style="background-image:url(http://img02.taobaocdn.com/tps/i2/T1aMlmFn4cXXae1H3s-640-880.png)"></li>',
				'	<li style="background-image:url(http://img02.taobaocdn.com/tps/i2/T1wDJjFjxfXXae1H3s-640-880.png)"></li>',
				'	<li style="background-image:url(http://img03.taobaocdn.com/tps/i3/T1MA8oFhpXXXae1H3s-640-880.png)"></li>',
				'	<li style="background-image:url(http://img04.taobaocdn.com/tps/i4/T1kX0pFbBXXXae1H3s-640-880.png);"></li>',
				'	<li style="background-image:url(http://img01.taobaocdn.com/tps/i1/T1MXRoFX0bXXae1H3s-640-880.png);" id="J_GuideHide"></li>',
				'</ul>'
			].join('')),//操作引导
		
			UI_TPL = new Xtpl([
			'<div class="subject-viewport" style="height:{{winHeight}}px"></div>',
			'<div class="subject-tip" id="J_Tip">向上向下快速滑动，切换专辑</div>',
			'<div class="subject-list-loading" id="J_ListLoading"></div>'
			].join('')),//tips loading 等公共模块结点
			
			ITEMLIST_TPL = new Xtpl([
            '{{#each data}}',
            '<li class="list-item J_ListItemGo" data-go="{{listId}}">',
            '  <img class="subject-list-item-icon" src="{{banner}}" alt="{{title}}">',
            '  <i class="subject-list-item-name">{{title}}</i>',
            '</li>',
            '{{/each}}'].join(''));//list结点填充数据

		/**
		 * DOM结构渲染
		 */
		function domRender(){
			var list = model.list,
				itemWidth = 320,
				navItemWidth = 80,
				velocity = 0.2;
			
			list.contentWidth = list.data.length * itemWidth;
			list.navContentWidth = (list.data.length + 2) * navItemWidth;
			list.winWidth = itemWidth;
			list.winHeight = window.innerHeight; //  + 60 hide addressbar
	
			var $body = S.one(document.body),
				$content = S.one('#J_PhoneDetail') || {},
				$viewport = S.one('.subject-viewport');
			
			
			
			// init DOM
			if (!inited) {
				//添加根节点
				$body.append(S.DOM.create(ROOT_TPL.render()));
				
				//添加List跟结点
				S.getScript('data/list.json',function(){
					if(LIST_DATA.success){
						var $listBox = S.get('#J_ListMore');
						S.DOM.insertBefore(S.DOM.create(ITEMLIST_TPL.render(LIST_DATA)), $listBox);
						//一次性绑定的事件 [主要是List]
						listBind();
					}
					//获取更多
					Hammer(S.get('#J_ListMore')).on('tap', function (ev) {
                        setTimeout(function(){
                            var $listBox = S.get('#J_ListMore');
                            S.DOM.insertBefore(S.DOM.create(ITEMLIST_TPL.render(LIST_DATA)), $listBox);
                            //绑定List]
                            listBind(true);
							phoneGlobal.listOpenMark = true;
							
							//loading显隐
							S.one('#J_LadingBox').show();
							window.setTimeout(function(){
								S.one('#J_LadingBox').hide();
							},500)
                        },500);
                    });
				});

				//添加Detail结点
				$content = S.one('#J_PhoneDetail');
				$content.append(UI_TPL.render(list));
				$viewport = S.one('.subject-viewport');
			}
			
			var $loading = S.one('#J_LadingBox'),
				$tip = S.one('#J_Tip');
	
			// 
			// slide init
			//
			$viewport.html(LIST_TPL.render(list));
			
			phoneGlobal.fsSlide = Flipsnap('.subject-content');
			
			var fsSlide = phoneGlobal.fsSlide;
			
			//首次加载的导航
			if(!Cookie.get('markStart')){
				
				S.one('#J_Guide').append(GUIDE_TPL.render());
				
				Flipsnap('#J_GuideOn');
				
				Hammer(S.get('#J_GuideHide')).on('tap', function (ev) {
					S.one('#J_Guide').css('display','none');
				});
				
				Cookie.set('markStart', 1, 365 * 102);
			}else{
				S.one('#J_Guide').css('display','none');
			}
				
			function showTip(innerText) {
				if(innerText){
					$tip[0].innerHTML = innerText;
				}
				$tip.addClass('tipRun');
				setTimeout(function(){
					hideTip();
				},1000)
			}
			phoneGlobal.showTip = showTip;
	
			function hideTip() {
				$tip.removeClass('tipRun');
				$tip[0].innerHTML = '';
			}
	
			// 使用 hashbang 记录 view index 
			fsSlide.element.addEventListener('fstouchend', function(ev) {
				var curView = getItemId(), // NaN的情况
					newView = ev.newPoint;
				
				//U.log('fstouchend', curView, newView);
				if (curView != newView) {
					location.hash = '!' + phoneGlobal.listId + '/' +  newView; // reset
					history.replaceState({state:phoneGlobal.listId},'',['sub.html?id=' + phoneGlobal.listId  + location.hash]);
				}
				//hideTip();
				
				//延迟执行标题和价格的直接渲染
				window.setTimeout(function(){itemDataRander();},200);
				
				fsNavSlide.moveToPoint((fsSlide.currentPoint + 1)/2);
				
				
			}, false);
	
			// nav init
			var $nav = S.one('.subject-nav'),
				$topNav = S.one('#J_TopNav');
	
			function isNavShow() {
				var bottom = parseInt($nav.css('bottom'), 10);
				return bottom === 0;
			}
	
			function hideNav() {
				$nav.css('bottom', '-140px');
			}
			
			// TODO 整理至mobile-issue：ios 6.1 safari，tap会有bug，导致页面跳转后误点击
			//Hammer($navBack.getDOMNode()).on('click', function(e) {
			//    location.href = 'list.html';
			//});
	
			phoneGlobal.fsNavSlide = Flipsnap('.subject-nav-content', {
				distance: navItemWidth * 2, // 80px * 2
				maxPoint: (list.data.length + 2 - itemWidth / navItemWidth) / 2
			});
			
			var fsNavSlide = phoneGlobal.fsNavSlide;
	
			//对首位和末位做特殊处理
			S.each(S.all('.subject-nav-item'), function(item, i) {
				var $item = S.one(item);
				if(i == 0 || i == (S.query('.subject-nav-item').length - 1)){
					//首位和末位
				}else{
					Hammer(item).on('tap', function(e) {
						fsSlide.moveToPoint(i - 1);
						location.hash = '!' + phoneGlobal.listId + '/' +  (i - 1);
						history.replaceState({state:phoneGlobal.listId},'',['sub.html?id=' + phoneGlobal.listId  + location.hash]);
						itemDataRander();
					}, {swipe_velocity: velocity});
				}
			});
			
			// delay hide
			setTimeout(function() {
				$loading.hide();
			}, 500);
	
		}
		
		/**
		 * 不需要重复绑定的事件
		 */
		function listBind(review){
			phoneGlobal.listOpenMark = false;

			//绑定点击List图片进入对应用列表
			S.each(S.query('.J_ListItemGo'), function(item, i) {
				//单击
				Hammer(item).on('tap',function(ev) {
					phoneGlobal.listOpenMark = false;
					listBoxClose();
					setTimeout(function(){
						var id = S.one(item).attr('data-go')*1;
						if(phoneGlobal.listId == id){
							//同一个目录的话就不用跳了……
						} else{
							phoneGlobal.listOpenMark = false;
							location.hash = '!' + id + '/' +  '0';
							phoneGlobal.listId = id;
							history.replaceState({state:id},'',['sub.html?id=' + id  + location.hash]);
							//出现loading
							S.one('#J_LadingBox').show();
							go(id);
						}
					},500);
				});
				
			});
			
			//保证这些是永远只执行一次
			if(!review){
				//列表的显隐
				function listBoxOpen(){
					S.one('#J_PhoneDetail').addClass('phoneDetailRun');
					S.one('#J_ListLoading').css({"display":"block"});
					S.one('#J_PhoneList').css({"display":"block"});
				}
				phoneGlobal.listBoxOpen = listBoxOpen;
				
				function listBoxClose(){
					S.one('#J_PhoneDetail').removeClass('phoneDetailRun');
					S.one('#J_ListLoading').css({"display":"none"});
					S.one('#J_PhoneList').css({"display":"none"});
					phoneGlobal.aTBoxClouse();
				}
				phoneGlobal.listBoxClose = listBoxClose;
				
				//模拟overflow:auto
				function getiScroll() {
					if (!iScroll) {
						setTimeout(function () {
							getiScroll();
						}, 500);
					} else {
						var myscroll = new iScroll("J_PhoneList", {
							snap: "li",
							momentum: true,
							hScroll: false,
							hScrollbar: false,
							vScrollbar: true
						});
					}
				}
			}
			
		}
		
		/**
		 * 回显函数
		 */
		function review(){
			
			var fsSlide = phoneGlobal.fsSlide,
				fsNavSlide = phoneGlobal.fsNavSlide,
				view = getItemId();

			//回显index
			fsSlide.moveToPoint(view);
			
			//快捷导航
			fsNavSlide.moveToPoint(parseInt((fsSlide.currentPoint + 1)/2));


			if(phoneGlobal){
				
				//如果小猫打开状态下，单机图片区域，则为关闭小猫
				if(phoneGlobal.transformMark){
					phoneGlobal.aTBoxOpen();
				}
				//如果快捷预览打开，则关闭
				if(!phoneGlobal.toggleNavMark){
					phoneGlobal.toggleNav(true);
				}
			}
			
		}
		
		/**
		 * 事件绑定中心
		 */
		function activeBind(){
			
			var J_ATBox = S.get('#J_ATBox'),//获取小猫
				$nav = S.one('.subject-nav'),
				$topNav = S.one('#J_TopNav'),//获取顶部导航
				mainButtonActive = true,//给小猫的点击计数
				topbarMark = false, //给顶部导航计数 true为开启
				$loading = S.one('#J_LadingBox'),//loading加载状态
				velocity = 0.2,
				barStatus = {
					status : 0	
				};
			
			//对每个item做事件绑定
			/**
			S.each(S.all('.subject-item'), function(item, i) {
				var hItem = Hammer(item);
				
				//快速上拖拽出导航
				hItem.on('swipeup', function(e) {
					//changeSubject(model.next);
					if(barStatus.status === 0){
						toggleNav();
						barStatus.status = -1;
					}
					
					if(barStatus.status === 1){
						toggleTopNav();
						barStatus.status = 0;
					}
					
				}, {swipe_velocity: velocity});
				
				//快速下拖拽出导航
				hItem.on('swipedown', function(e) {
					//changeSubject(model.prev);
					if(barStatus.status === 0){
						toggleTopNav();
						barStatus.status = 1;
					}
					
					if(barStatus.status === -1){
						toggleNav();
						barStatus.status = 0;
					}
	
				}, {swipe_velocity: velocity});
			});
			*/
			
			//绑定双击图片进入detail
			S.each(S.query('.J_DblclickTo'), function(item, i) {
				
				//双击
				Hammer(item).on('doubletap',function(ev) {
					window.location.href = S.one(this).attr('data-link');
				});
				
				//单击
				Hammer(item).on('tap',function(ev) {
					//如果小猫打开状态下，单机图片区域，则为关闭小猫
					if(phoneGlobal.transformMark){
						aTBoxClouse();
					} else { 
						//如果小猫关闭状态下，拉出下拉
						if(!topbarMark){
							KISSY.one('#J_TopNav').addClass('subjectTopnavRun'); //开启顶部导航
							topbarMark = true;//记住点击奇偶状态
						}else{
							KISSY.one('#J_TopNav').removeClass('subjectTopnavRun'); //关闭顶部导航
							S.one('#J_IShareDemo').css('display','none');//你妹的，分享也连带关闭一下吧。
							topbarMark = false;
						}
					}
				});
				
				//长按
				Hammer(item).on('hold',function(ev) {
					toggleNav();
				});
				
			});
			
			//List列表单击
			Hammer(S.get('#J_ShowList')).on('tap',function(){
				if(!phoneGlobal.listOpenMark){
					phoneGlobal.listOpenMark = true;
					phoneGlobal.listBoxOpen();//打开
				}
			});
			
			//阴影处单击隐藏List
			Hammer(S.get('#J_ListLoading')).on('tap',function(){
				if(phoneGlobal.listOpenMark){
					phoneGlobal.listOpenMark = false;
					phoneGlobal.listBoxClose();//关闭
				}
			});
			
			//小猫的单击事件
			Hammer(J_ATBox).on('tap',function(){
				if(mainButtonActive){
					aTBoxOpen();//打开
				}else{
					aTBoxClouse();//关闭
				}
			})
			
			//小猫的拖拽事件
			Hammer(J_ATBox).on('touchstart', function(e) {
				e.preventDefault();
				if(!phoneGlobal.transformMark){
					var touch = e.touches[0];
					var obj = J_ATBox;
					
					obj.lastX=touch.pageX;
					obj.lastY=touch.pageY;
					if(!obj.moveX){
						obj.moveX=0;
						obj.moveY=0;
					}
					S.one(J_ATBox).css('-webkit-transition','all 0s 0s');
				}
			});
			
			Hammer(J_ATBox).on('touchmove', function(e) {
				e.preventDefault();
				if(!phoneGlobal.transformMark){
					var touch = e.touches[0],
					maxHeight = -(phoneGlobal.height - 80),
					maxWidth = (phoneGlobal.width - 70),
					obj = J_ATBox;
				
					//获取偏移量
					obj.moveX += (touch.pageX-obj.lastX);
					obj.moveY += (touch.pageY-obj.lastY);
					obj.moveX = (obj.moveX < -10)?-10:obj.moveX;
					obj.moveX = (obj.moveX > maxWidth)?maxWidth:obj.moveX;
					obj.moveY = (obj.moveY > 0)?0:obj.moveY;
					obj.moveY = (obj.moveY < maxHeight)?maxHeight:obj.moveY;
					
					S.one(J_ATBox).css('-webkit-transform','translate('+obj.moveX+'px,'+obj.moveY+'px)');
					obj.lastX=touch.pageX;
					obj.lastY=touch.pageY;
				}
			});
			
			//小猫的拖拽停止回复CSS3动画
			Hammer(J_ATBox).on('touchend', function(e) {
				S.one(J_ATBox).css('-webkit-transition','all 0.2s 0s');
			});
			
			//小猫长按，也能开关快捷图片层
			Hammer(J_ATBox).on('hold', function(e) {
				toggleNav();
			});
			
			//下一个活动专题
			Hammer(S.get('#J_ListNext')).on('tap', function(e) {
				//此货来完成头尾衔接o(∩_∩)o 
				phoneGlobal.goTheWay = true;
				changeSubject(model.next);
			});
			
			//上一个活动专题
			Hammer(S.get('#J_ListPrev')).on('tap', function(e) {
				phoneGlobal.goTheWay = false;
				changeSubject(model.prev);
			});
			
			//点击收藏
			Hammer(S.get('#J_SubjectFav')).on('tap', function(e) {
				if(S.one('.subjectNavFavRun',S.get('#J_SubjectFav'))){
					S.one('i',S.get('#J_SubjectFav')).removeClass('subjectNavFavRun');
					phoneGlobal.showTip('取消收藏！');
				} else {
					S.one('i',S.get('#J_SubjectFav')).addClass('subjectNavFavRun');
					phoneGlobal.showTip('成功收藏当前商品！');
				}
			});
			
			//分享插件
			Hammer(S.get('#J_IShare')).on('tap', function(e) {
				if(S.one('#J_IShareDemo').css('display') == 'none'){
					S.one('#J_IShareDemo').css('display','block');
				} else {
					S.one('#J_IShareDemo').css('display','none');
					phoneGlobal.showTip('已经分享到微博');
					setTimeout(function(){
						KISSY.one('#J_TopNav').removeClass('subjectTopnavRun'); //关闭顶部导航
						topbarMark = false;
					},600);
				}
			});
			
			//点击进入详情页
			Hammer(S.get('#J_ToDetail')).on('tap', function(e) {
				location.href = S.one(S.query('.J_DblclickTo')[phoneGlobal.fsSlide.currentPoint]).attr('data-link');
			});
			
			//小猫的关闭
			function aTBoxClouse(){
				S.one(J_ATBox).css('-webkit-transform',phoneGlobal.transformMark);//回忆小猫的定位
				phoneGlobal.transformMark = false;//g告知小猫已经闭合
				
				KISSY.one(J_ATBox).removeClass('startRun');//开始跑CSS3动画
				KISSY.one('.at-menu', J_ATBox).removeClass('atMenuRun');
				
				KISSY.one('#J_TopNav').removeClass('subjectTopnavRun');
				mainButtonActive = true;//记住点击奇偶状态
				topbarMark = false;//记住点击奇偶状态
			}
			phoneGlobal.aTBoxClouse = aTBoxClouse;
			
			//小猫的打开
			function aTBoxOpen(){
				var _J_ATBox = S.one(J_ATBox);
				
				phoneGlobal.transformMark = _J_ATBox.css('-webkit-transform') || true;//记住小猫的定位

				_J_ATBox.css('-webkit-transform','translate(0px, 0px)');
				itemDataRander();
				
				KISSY.one(J_ATBox).addClass('startRun');//开始跑CSS3动画
				setTimeout(function(){KISSY.one('.at-menu', J_ATBox).addClass('atMenuRun');},200);

				KISSY.one('#J_TopNav').addClass('subjectTopnavRun'); //开启顶部导航
				mainButtonActive = false;
				topbarMark = true;//记住点击奇偶状态
			}
			//开放给当前全局
			phoneGlobal.aTBoxOpen = aTBoxOpen;
			
			/**
			 * @param {string} id
			 */
			function changeSubject(id) {
				// TODO 
				// history api 兼容PC端和手机端，处理url变动（非hash）
				// 处理android back键，监听hashchange
				//location.href = "sub.html?id=" + id;
				
				//用参记录自己的listId,通知全局
				phoneGlobal.listId = id;

				if (phoneGlobal.goTheWay) {
					location.hash = '!' + id + '/' +  '0';
					history.replaceState({state:id},'',['sub.html?id=' + id  + location.hash]);
				} else {
					location.hash = '!' + id + '/' +  '999';
					history.replaceState({state:id},'',['sub.html?id=' + id  + location.hash]);
				}
				
				$loading.show();
				go(id);
			}
			
			//顶部导航
			function toggleTopNav(){
				var top = parseInt($topNav.css('top'), 10);
				$topNav.css('top', top < 0 ? 0 : '-44px');
			}
			
			//底部菜单的显隐
			function toggleNav(review) {
				var bottom = parseInt($nav.css('bottom'), 10),
					_toggleNav = phoneGlobal.toggleNavMark;
				if(!review){
					if(_toggleNav){
						S.one(J_ATBox).removeClass('at-box-over');
						phoneGlobal.toggleNavMark = false;
					}else{
						S.one(J_ATBox).addClass('at-box-over');
						phoneGlobal.toggleNavMark = true;
					}
				}
				$nav.css('bottom', bottom < 0 ? 0 : '-140px');
				
			}
			
			//开放给当前全局
			phoneGlobal.toggleNav = toggleNav;
		}
		
		//公共函数
		function itemDataRander(){
			//修改详情框架里面的数据
			var dataItem = S.one(S.query('.subject-item')[phoneGlobal.fsSlide.currentPoint]);
			S.get('#J_ItemTitle').innerHTML = dataItem.attr('data-title');
			S.get('#J_ItemPrice').innerHTML = '全国统一:￥' + dataItem.attr('data-price');	
		}

		phoneInit();
    }

	/**
	 * PC端构造
	 */
    function renderPc(model) {
		
		// PC端列表模板
		var PC_LIST_TPL = new Xtpl([
			'<ul class="j-subject-container subject-container">',
			'{{#each data}}<li>',
			'<div class="list-container">',
			'<img width="{{width}}" height="{{height}}" src="{{skuImgUrl}}" />',
			'<div class="cover-container">',
			'<a target="_blank" href="{{skuClickUrl}}">',
			'<div class="top-mask" style="width:{{width}}px; height:{{height}}px;">',
			'{{set check_detail_top = (height -50)/2 check_detail_left = (width - 72)/2}}',
			'<p class="check-detail" style="top:{{check_detail_top}}px; left:{{check_detail_left}}px;"></p>',
			'</div>',
			'</a>',
			'<div class="sku-info">',
			'<p class="sku-name" title="{{skuName}}">{{skuName}}</p>',
			'<p class="sku-price">&yen;{{skuPrice}}</p>',
			'</div>',
			'</div>',
			'</div>',
			'</li>{{/each}}',
			'</ul>'
			].join(''));

        var $content,
            list;

        $content = S.one('#content');
        list = model.list;
        $content.append(PC_LIST_TPL.render(list));

        S.use('gallery/autoResponsive/1.0/index', function(S, AutoResponsive) {
            new AutoResponsive({
                container: '.j-subject-container',
                selector: 'li',
                colMargin: {
                    x: 10,
                    y: 10
                }
            });
        });
    }
	
	/**
	 * resize主要是用于演示用的
	 */
	function resizePhone(){
		var resizeLater = false;//用于延迟执行resize防止事件堆叠
		S.Event.on(window,'resize',function(){
			if(resizeLater){
				clearTimeout(resizeLater);
			}
			resizeLater = setTimeout(function(){
				if(innerWidth < 480){
					S.one('#J_PhoneDetail .subject-nav').css({'bottom':'0'});
					S.one('#J_PhoneDetail .subject-viewport').css({'height':innerHeight + 'px'});
				}
			},200);	
		});
	}

    // init
    init();
});


if (window.addEventListener) {
    window.addEventListener("load", function() {
        setTimeout(function() {
            window.scrollTo(0, 1);
        }, 0);
    });
}