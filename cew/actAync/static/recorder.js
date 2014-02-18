function overrideEvent(element,type){
	//如果已经override过了，则不再做处理
	if(element["isOverride" + type]){return;}

	if(element['on' + type]){
		var old = element["on" + type];
		element.addEventListener(type,function(e){
			old.apply(this,[e]);
		},false);
		element['on' + type] = null;
	}
	element['isOverride' + type] = true;
}

function overrideElementEvents(){
	var nodes = document.body.getElementsByTagName("*");
	var item = null;
	for(var i=0,len = nodes.length;i < len;i++){
		item = nodes[i];
		if(item && item.nodeType == 1){
			overrideEvent(item,'mouseover');
			overrideEvent(item,'click');
		}
	}
}


//判断指定的element是否给绑定了事件
var findHasEventsElement = function(element,eventType){
	if (!element.tagName) return null;

	if ((element['events'] && element['events'][eventType]) || element.hasAttribute("on" + eventType) || element["on" + eventType]) {
		return element;
	} else {
		if (element.parentNode != null) {
			return findHasEventsElement(element.parentNode,eventType);
		} else {
			return null;
		}
	}
}


function startRecord(device){

	document.addEventListener("click",function(e){
		if(e.button === 0){
			var target = e.target,
				enable = findHasEventsElement(target,"click");

			if(enable){
				socket.emit("send", { device : device, action : "click", target : getSelector(target), time : +new Date() });
			}
		}
	},true);


	document.addEventListener("touchstart",function(e){
		var target = e.target,
			enable = findHasEventsElement(target,"touchstart");

		if(enable){
			socket.emit("send", { device : device, action : "touchstart", target : getSelector(target), time : +new Date() });
		}
	},true);


	//处理那些动态插入的内容的事件绑定，比如通过addEventListener重新绑定了，并没有计算在内
	window.addEventListener("load",function(){
		document.addEventListener("DOMNodeInserted", function(){
			overrideElementEvents();
		}, false);
		overrideElementEvents();
	},false);

}