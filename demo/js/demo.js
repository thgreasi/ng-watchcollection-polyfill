var myapp = angular.module('demoApp', ['ng.watchcollection.polyfill']);

myapp.buildArray = function(name, size) {
  var i, array = [];
  for (i = 1; i <= size; i++){
    array.push({
      text: name + ' ' + i ,
      value: i
    });
  }

  return array;
};

myapp.controller('demoController', function ($scope, ngWatchCollectionPolyfillService) {
  'use strict';

  $scope.newItemText = '';
  $scope.list = myapp.buildArray('Item', 3);
  $scope.logList = [];

  $scope.addItem = function() {
    if (!$scope.newItemText || !$scope.newItemText.length) {
      return;
    }

    $scope.list.push({
      text: $scope.newItemText,
      value: $scope.list.length + 1
    });
    $scope.newItemText = '';
  };

  $scope.removeItem = function(index) {
    $scope.list.splice(index, 1);
  };

  $scope.$watchCollection('list', function(newVal, oldVal) {
    if (newVal === oldVal) {
      return;
    }
    $scope.logList.push(oldVal.length + ' => ' + newVal.length);
  });
});