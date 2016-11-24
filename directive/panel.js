/**
 * Created by zzjz-pc15 on 2016/5/14.
 */
(function(){
    'use strict';
    var lf_panel_z_index = 0;
    var lf_panel_id = 0;
    var lf_animate_bool = true;
    angular.module("panel",[]).factory('panelService',['$rootScope',function($rootScope){
        var _group = [];
        var _bottomGroup = [];
        var _deleteScope = null;
        function setAnimate(animateObj,target) {
            var timer = null;
            timer = setInterval(function () {
                var iStop = true;
                var obj = animateObj.prop("offsetLeft");
                var speed = (target - obj) / 200;
                speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
                if (obj != target) {
                    iStop = false;
                }
                animateObj.css({
                    left: obj + speed + "px"
                });
                if (iStop) {
                    clearInterval(timer);
                }
            }, 60);
        }
        return{
            pushPanel:function(currentScope){
                _group.push(currentScope);
            },
            getPanelList:function(){
                return _group;
            },
            deletePanel:function(list,currentScope){
                var len = _group.length;
                for (var i = 0; i < len;i++){
                    if(_group[i].panelId == _deleteScope.panelId){
                        _group.splice(i, 1);
                        list.splice(i, 1);
                        currentScope.$digest();
                        break;
                    }
                }
            },
            deletePanelBroadcast:function(currentScope){
                _deleteScope = currentScope;
                $rootScope.$broadcast("deletePanel");
            },
            addBottomPanel:function(currentScope){
                var len = _bottomGroup.length;
                var isExist = false;
                for(var i = 0; i < len; i++){
                    if(_bottomGroup[i].panelId == currentScope.panelId){
                        isExist = true;
                        break;
                    }
                }
                !isExist && _bottomGroup.push(currentScope);
            },
            removeBottomPanel:function(currentScope){
                var len = _bottomGroup.length;
                var isDelete = false;
                for(var i = 0; i < len; i++){
                    if(_bottomGroup[i].panelId == currentScope.panelId){
                        _bottomGroup.splice(i, 1);
                        isDelete = true;
                        break;
                    }
                }
                if(isDelete){
                    var length = _bottomGroup.length;
                    for(var j = 0;j < length;j++ ){
                        _bottomGroup[j].container.css({
                            left:j*160+"px"
                        })
                    }
                }
            },
            getBottomPanelList:function(){
                return _bottomGroup;
            }
        }
    }])
        .factory("windowResize",["$window", "$timeout",function($window, $timeout){
            return function ($scope) {
                var fns = [];
                function callAll() {
                    for (var i = 0; i < fns.length; i++) {
                        fns[i]();
                    }
                }
                var currentWindow = angular.element($window);
                currentWindow.on("resize", callAll);
                $scope.$on("$destroy", function () {
                    currentWindow.off("resize", callAll);
                });
                return {
                    call: function (fn) {
                        fns.push(fn);
                        $timeout(fn);
                        return this;
                    }
                };
            };
        }])
        .factory("delayWait",["$timeout",function($timeout){
            return function (wait, fn, no_postpone) {
                var args, context, result, timeout;
                var executed = true;
                function ping() {
                    result = fn.apply(context || this, args || []);
                    context = args = null;
                    executed = true;
                }
                function cancel() {
                    if (timeout) {
                        $timeout.cancel(timeout);
                        timeout = null;
                    }
                }
                function wrapper() {
                    context = this;
                    args = arguments;
                    if (!no_postpone) {
                        cancel();
                        timeout = $timeout(ping, wait);
                    } else if (executed) {
                        executed = false;
                        timeout = $timeout(ping, wait);
                    }
                }
                function flushPending() {
                    var pending = !!context;
                    if (pending) {
                        cancel();
                        ping();
                    }
                    return pending;
                }
                wrapper.flush = function () {
                    if (!flushPending() && !timeout) {
                        ping();
                    }
                    return result;
                };
                wrapper.flushPending = function () {
                    flushPending();
                    return result;
                };
                wrapper.cancel = cancel;
                return wrapper;
            };
        }])
        .directive("panel",['$document','$window','$compile','panelService','windowResize','delayWait',function($document,$window,$compile,panelService,windowResize,delayWait){
            function linkOperation(){
                return function (scope,element,attrs){
                    var parentNode = angular.element($document[0].body);
                    if(!parentNode[0].querySelector(".lf_panel_bottom")){
                        var divs = "<div class='lf_panel_bottom'></div>";
                        var template = angular.element(divs);
                        var newHtml = $compile(template)(scope);
                        parentNode.append(newHtml);
                    }
                    lf_panel_id ++;
                    scope.panelId = "lf_panel_id_"+lf_panel_id;
                    var container = angular.element(element[0].querySelector('.lf_panel_container'));
                    container.css("z-index",lf_panel_z_index);
                    scope.container = container;
                    var header = angular.element(container[0].querySelector('.lf_panel_navigation'));
                    var func = angular.element(header[0].querySelector('.lf_panel_function'));
                    var minSize = angular.element(func[0].querySelector("#lf_panel_minsize"));
                    var maxSize = angular.element(func[0].querySelector("#lf_panel_maxsize"));
                    var closeView = angular.element(func[0].querySelector("#lf_panel_close"));
                    var corner = angular.element(container[0].querySelector('.lf_panel_corner'));
                    var bottomControl = angular.element(document.getElementsByClassName('lf_panel_bottom'));
                    container.css({
                        top:Math.floor(Math.random()*100+80)+"px",
                        left:Math.floor(Math.random()*130+120)+"px",
                        width:scope.styleConfig.defaultWidth*$document[0].body.clientWidth+"px",
                        height:scope.styleConfig.defaultHeight*bottomControl.prop("offsetTop")+"px"
                    });
                    panelService.pushPanel(scope);
                    scope.postion = {
                        left:container.prop('offsetLeft'),
                        top:container.prop('offsetTop'),
                        width:container.prop('offsetWidth'),
                        height:container.prop('offsetHeight')
                    };
                    function setContainerIndex(){
                        lf_panel_z_index++;
                        container.css("z-index",lf_panel_z_index);
                    }
                    container.on("mousedown",function(){
                        setContainerIndex();
                    });
                    var moveDisabled = false;
                    var disX = 0;
                    var disY = 0;
                    header.on('mousedown', function (event) {
                        event.preventDefault();
                        if(moveDisabled){
                            return;
                        }
                        disX = event.clientX - container.prop('offsetLeft');
                        disY = event.clientY - container.prop('offsetTop');
                        $document.on('mousemove', mouseMove);
                        $document.on('mouseup', mouseUp);
                    });
                    function mouseMove(event) {
                        var l = event.clientX - disX;
                        var t = event.clientY - disY;
                        var bHeight = bottomControl.prop('offsetTop');
                        if(l <= 0){
                            l = 0;
                        }else if( l > $document[0].body.clientWidth - container.prop('offsetWidth')){
                            l = $document[0].body.clientWidth - container.prop('offsetWidth');
                        }
                        if(t <= 0){
                            t = 0;
                        }
                        else if(t > bHeight - container.prop('offsetHeight')){
                            t = bHeight - container.prop('offsetHeight');
                        }
                        scope.postion.top = t;
                        scope.postion.left = l;
                        container.css({
                            top: t + 'px',
                            left: l + 'px'
                        });
                    }
                    function mouseUp() {
                        $document.off('mousemove', mouseMove);
                        $document.off('mouseup', mouseUp);
                    }
                    var startHeight = 0;
                    var startWidth = 0;
                    corner.on('mousedown', function (event) {
                        event.preventDefault();
                        startWidth = event.clientX - container.prop('offsetLeft') - container.prop('offsetWidth');
                        startHeight = event.clientY - container.prop('offsetTop') - container.prop('offsetHeight');
                        $document.on('mousemove', mouseDrag);
                        $document.on('mouseup', mouseDrop);
                    });
                    function mouseDrag(event) {
                        var height = event.clientY - container.prop('offsetTop')  - startHeight;
                        var width = event.clientX - container.prop('offsetLeft') - startWidth;
                        var bHeight = bottomControl.prop('offsetTop');
                        if(width >= $document[0].body.clientWidth - container.prop('offsetLeft')){
                            width = $document[0].body.clientWidth - container.prop('offsetLeft');
                        }
                        if(height >= bHeight- container.prop('offsetTop')){
                            height = bHeight - container.prop('offsetTop');
                        }
                        scope.postion.width = width;
                        scope.postion.height = height;
                        container.css({
                            height: height + 'px',
                            width: width + 'px'
                        });
                    }
                    function mouseDrop() {
                        $document.off('mousemove', mouseDrag);
                        $document.off('mouseup', mouseDrop);
                    }
                    maxSize.on('mousedown',function(event){
                        event.preventDefault();
                        event.cancelBubble = true;
                        setContainerIndex();
                        if(lf_animate_bool){
                            minSize.removeClass("glyphicon glyphicon-th-large");
                            minSize.addClass("glyphicon glyphicon-minus");
                            panelService.removeBottomPanel(scope);
                            if(container.prop('offsetWidth') != $document[0].body.clientWidth){
                                var bHeight = bottomControl.prop('offsetTop');
                                lf_animate_bool = false;
                                setAnimate({
                                    width:$document[0].body.clientWidth,
                                    height:bHeight,
                                    left:0,
                                    top:0
                                },function(){
                                    maxSize.removeClass("glyphicon-resize-full");
                                    maxSize.addClass("glyphicon-resize-small");
                                    corner.css({display:"none"});
                                    lf_animate_bool = true;
                                });
                            }else {
                                lf_animate_bool = false;
                                setAnimate({width:scope.postion.width,height:scope.postion.height,left:scope.postion.left,top:scope.postion.top},function(){
                                    maxSize.removeClass("glyphicon-resize-small");
                                    maxSize.addClass("glyphicon-resize-full");
                                    corner.css({display:"block"});
                                    lf_animate_bool = true;
                                    moveDisabled = false;
                                });
                            }
                        }

                    });
                    scope.isAtBottom = false;
                    minSize.on('mousedown',function(event){
                        event.preventDefault();
                        setContainerIndex();
                        event.cancelBubble = true;
                        if(lf_animate_bool){
                            if(container.prop('offsetWidth') == 160){
                                panelService.removeBottomPanel(scope);
                                lf_animate_bool = false;
                                setAnimate({
                                    width:scope.postion.width,
                                    height:scope.postion.height,
                                    left:scope.postion.left,
                                    top:scope.postion.top
                                },function(){
                                    minSize.removeClass("glyphicon glyphicon-th-large");
                                    minSize.addClass("glyphicon glyphicon-minus");
                                    corner.css({display:"block"});
                                    lf_animate_bool = true;
                                    moveDisabled = false;
                                    scope.isAtBottom = false;
                                });
                            }else {
                                var curTop = bottomControl.prop('offsetTop');
                                var toLeft = panelService.getBottomPanelList().length*160;
                                lf_animate_bool = false;
                                setAnimate({width:160,height:35,left:toLeft,top:curTop},function(){
                                    minSize.removeClass("glyphicon glyphicon-minus");
                                    minSize.addClass("glyphicon glyphicon-th-large");
                                    maxSize.removeClass("glyphicon-resize-small");
                                    maxSize.addClass("glyphicon-resize-full");
                                    corner.css({display:"none"});
                                    panelService.addBottomPanel(scope);
                                    lf_animate_bool = true;
                                    moveDisabled = true;
                                });
                            }
                        }

                    });
                    function getStyle(d){
                        if(d == "width") return container.prop("offsetWidth");
                        if(d == 'height')return container.prop("offsetHeight");
                        if(d == 'left') return container.prop("offsetLeft");
                        if(d == 'top') return container.prop("offsetTop");
                        return 0;
                    };
                    function setAnimate(data,backFunc){
                        var timer = null;
                        timer = setInterval(function(){
                            var iStop=true;
                            for(var item in data){
                                var obj = getStyle(item);
                                var speed = (data[item]-obj)/4;
                                speed = speed>0?Math.ceil(speed):Math.floor(speed);
                                if(obj != data[item])
                                {
                                    iStop = false;
                                }
                                var newO = new  Object();
                                newO[item]= obj+speed+"px";
                                container.css(newO);
                            }
                            if(iStop){
                                clearInterval(timer);
                                if(backFunc){
                                    backFunc();
                                }
                            }
                        },30);
                    };
                    closeView.on('mousedown',function(){
                        event.preventDefault();
                        setContainerIndex();
                        event.cancelBubble = true;
                        panelService.deletePanelBroadcast(scope);
                        panelService.removeBottomPanel(scope);
                    });
                    var resizeX = bottomControl.prop("offsetWidth");
                    var resizeY = bottomControl.prop("offsetTop");
                    var resizeDelay = delayWait(500,function(){
                        //var l = container.prop("offsetLeft")+(bottomControl.prop("offsetWidth")-resizeX);
                        var t = container.prop("offsetTop")+(bottomControl.prop("offsetTop")-resizeY);
                        //if(l <= 0){
                        //    l = 0;
                        //}else if(l > $document[0].body.clientWidth - container.prop("offsetWidth")){
                        //    l = $document[0].body.clientWidth - container.prop("offsetWidth");
                        //}
                        if(t <= 0){
                            t = 0;
                        }else if(t > bottomControl.prop("offsetTop")-container.prop("offsetHeight")+35){
                            t = bottomControl.prop("offsetTop")-container.prop("offsetHeight")+35;
                        }
                        container.css({
                            top:t+"px"
                        });
                        resizeX = bottomControl.prop("offsetWidth");
                        resizeY = bottomControl.prop("offsetTop");
                    });
                    windowResize(scope).call(function(){
                        resizeDelay();
                    });
                }
            }
            var templateDivs = "<div class='lf_panel_container'>";
            templateDivs += "<div class='lf_panel_navigation'><span ng-bind='styleConfig.defaultName'></span><ul class='lf_panel_function'><li id='lf_panel_minsize'class='glyphicon glyphicon-minus'></li><li id='lf_panel_maxsize' class='glyphicon glyphicon-resize-full'></li><li id = 'lf_panel_close' class='glyphicon glyphicon-remove'></li></ul></div>";
            templateDivs += "<div class='lf_panel_corner'></div>";
            templateDivs += "<div class='lf_panel_transclude' ng-transclude></div>";
            templateDivs += "<div>";
            return{
                transclude:true,
                scope:{
                    styleConfig:"="
                },
                template:templateDivs,
                link:linkOperation()
            }
        }])

}());