angular.module('debugger', ['debuggerService'])
	.controller('DebuggerCtrl', ['$scope', 'debuggerServ', function($scope, debuggerServ){
		$scope.list = [];
		$scope.modules = debuggerServ.modules;
		$scope.filters = debuggerServ.filters;

		$scope.init = function(){
			debuggerServ.load(function(){
				$scope.list = debuggerServ.list;
			});
			$scope.checkFilters();
			$scope.search();
		};

		$scope.filter = $scope.filters[0];
		$scope.module = $scope.modules[0];

		$scope.pickModule = function(nr){
			$scope.module = $scope.modules[nr];
			$scope.search();
		};

		$scope.pickFilter = function(nr){
			$scope.filter = $scope.filters[nr];
			$scope.search();
		};

		$scope.checkFilters = function(){
			debuggerServ.checkFilters();
		};

		$scope.search = function(){
			debuggerServ.search($scope.module.type, $scope.filter.type);
		};

		$scope.clear = function(all){
			if(all)
				debuggerServ.clear();
			else
				debuggerServ.clear($scope.module.type, $scope.filter.type);
		}
	}]);