angular.module('main', ['manualService', 'scheduleService'])
	.controller('ControlCtrl', ['$scope', '$interval', 'ManualFactory', 'scheduleServ', function($scope, $interval, Manual, Schedule){
		$scope.init = function(){
			Schedule.load(function(){
				$scope.schedules = Schedule.list;
			});
		};

		$scope.manualControl = false;
		$scope.schedules = null;
		$scope.statusView = Manual.statusView;
		$scope.unitView = Manual.unitView;
		$scope.status = Manual.status;
		$scope.unit = Manual.unit;

		//axis
		$scope.dataset = Manual.statusHistory;

		/*
		$scope.froms = [
			{
				name: 'od',
				type: 'from'
			},
			{
				name: 'do',
				type: 'to'
			}
		];
		$scope.from = $scope.froms[0];

		$scope.types = [
			{
				name: 'live',
				type: 'live'
			},
			{
				name: 'godzina',
				type: 'hour'
			},
			{
				name: 'dzien',
				type: 'day'
			},
			{
				name: 'tydzien',
				type: 'week'
			}
		];
		$scope.type = $scope.types[0];

		$scope.viewTime = function(){

		};*/

		$scope.manual = function(){
			if($scope.manualControl){
				Manual.start();
			}else
				Manual.stop();
		};
	}])
	.directive('temp', function(){
		return {
			restrict: 'A',
			scope: {
				temp: '='
			},
			link: function(scope, element){
				scope.$watch(function(){
					return scope.temp;
				}, function(val){
					var level = (1-Math.min(val, 100)/100)*240;

					element.css({
						backgroundColor: 'hsl('+level+', 100%, 50%)',
						borderColor: 'hsl('+level+', 100%, 50%)'
					});
				});
			}
		};
	})
	.directive('plotter', function(){
		return {
			restrict: 'A',
			scope: {
				plotter: '='
			},
			link: function(scope, element, attrs) {
				var height = element.parent().height(),
					width = element.parent().width(),
					plot;

				element.css({
					height: height,
					width: width
				});

				plot = $.plot(element, [], {
					xaxis: {
						mode: 'time'
					}
				});

				scope.$watch(function(){
					return scope.plotter;
				}, function(data) {
					plot.setData(data);
					plot.setupGrid();
					plot.draw();
				}, true);
			}
		};
	});
