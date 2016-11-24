/**
 * Created by liufeng on 2016/11/24.
 */
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