# angular-panel
angular-panel is a plugin on the base of AngularJS 4.0+ framework,which acts as a container that supports multi-case and simple animation,Also hope your advice

# Features
i.  support multi-case<br/>
ii. act as container<br/>
iii. support simple animation<br/>
iv. support resizeable<br/>
v.support dragging<br/>

# Dependencies
This directive depends on angular ang Glyphicon Halflings(You can use your own icon to replace). No jQuery and Bootstrap required! It has been tested on angular 4.0+

# Contributing
Please submit all pull requests the against master branch. If your unit test contains JavaScript patches or features, you should include relevant unit tests. Thanks!

# Examples

Add angular.min.js & bootstrap.css to your HTML.Also add panel.js & panel.css.
<div class='highlight highlight-text-html-basic'>
<pre>
&lt link rel="stylesheet" href="bootstrap/css/bootstrap.min.css"/&gt
&lt link rel="stylesheet" href="directive/panel.css"/&gt
&lt script type="text/javascript" src="libs/angular.min.js"/&gt
&lt script type="text/javascript" src="directive/panel.js"/&gt
</pre>
</div>

Add panel as a module dependency for your app.
<div class='highlight highlight-text-html-basic'>
<pre>
var demo = angular.module("demo",['panel']);
</pre>
</div>

Add panel directive to that block which you want to add.
<div class='highlight highlight-text-html-basic'>
<pre>
&lt div panel ng-repeat ='data in panelList' style-config = 'data'&gt
       // add you want to add html
      &lt div&gt
       add dom
      &lt div/&gt
&lt/div&gt
</pre>
</div>

# Detail
<div class='highlight highlight-text-html-basic'>
<pre>
&lt button style="margin-top: 50px" ng-click="addPanel()"&gt panelAdd &lt/button&gt
&lt div panel ng-repeat ='data in panelList' style-config = 'data'&gt
       // add you want to add html
      &lt div&gt
       add dom
      &lt div/&gt
&lt/div&gt
</pre>
</div>
Attention:you must add 'panelService' to your controller,the function of the service is to mananger the life cycle of the multi-case
<div class='highlight highlight-text-html-basic'>
<pre>
var demo = angular.module("demo",['panel']);
demo.controller('contentCtrl',["$scope",'panelService',function($scope,panelService){
    /*panel*/
    $scope.panelList = [];
    var n = 0;
    $scope.addPanel = function(){
        n++;
        $scope.panelList.push({
            defaultWidth:"50%",
            defaultHeight:"60%",
            defaultName:"视图"+n
        })
    };
    $scope.$on("deletePanel",function(){
        panelService.deletePanel($scope.panelList,$scope);
    });
}]);
</pre>
</div>

# Options
{ <br/>
     defaultWidth:  // Defines the default width of container <br/>
     defaultHeight:  // Defines the default Height of container<br/>
     defaultName:// Defines the name of container<br/>
}

# Communication
if you have some advice or questions,you can add my Wechat('Elektrotechnik') or give me email(liufeng_2015@163.com)
