//TODO reset
//TODO reset all
//TODO program coloring
//TODO not null name

angular.module('program', ['programService'])
	.controller('ProgramCtrl', ['$scope', 'ProgramFactory', function($scope, Program) {
		$scope.init = function(){
			Program.load(function(){
				$scope.programs = Program.list;
			});

			Program.default($scope.program);
		};

		$scope.current = null;

		$scope.program = {};

		$scope.programs = Program.list;

		$scope.parameters = Program.paramList();

		$scope.add = function(){
			$scope.program = {};
			$scope.current = null;
			$scope.reset();
		};

		$scope.select = function(index){
			$scope.current = index;
			$scope.program = $scope.programs[index];
		};

		$scope.save = function(){
			Program.save($scope.current, $scope.program);

			if($scope.current===null)
				$scope.current = $scope.programs.length;
		};

		$scope.reset = function(){
			Program.default($scope.program);
		};

		$scope.delete = function(){
			if($scope.current!==null)
				Program.delete($scope.current);

			$scope.add();
		};
	}]);
