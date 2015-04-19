angular.module('main', ['manualService', 'scheduleService'])
	.controller('ControlCtrl', ['$scope', '$interval', 'ManualFactory', 'scheduleServ', function($scope, $interval, Manual, Schedule){
		$scope.init = function(){
			Schedule.load(function(){
				$scope.schedules = Schedule.list;
				$scope.attachSchedule();
			});
		};

		//$scope.actual = null;
		$scope.actualScheduleName = null;
		$scope.manualControl = false;
		$scope.schedules = null;
		$scope.actualSchedule = null;
		$scope.statusView = Manual.statusView;
		$scope.unitView = Manual.unitView;
		$scope.status = Manual.status;
		$scope.unit = Manual.unit;
		$scope.mode = 'live';

		$scope.$watch('unit', function() {
			if($scope.manualControl)
				Manual.update();
		}, true);

		$scope.attachSchedule = function(id){
			$scope.schedules.some(function(schedule){
				if((id!==undefined && schedule.id===id) || (id===undefined && schedule.active)){
					$scope.actualSchedule = schedule.id;
					$scope.actualScheduleName = schedule.name;
					return true;
				}
				return false;
			});
		};

		$scope.activateSchedule = function(id){
			$scope.attachSchedule(id);
			Schedule.activate(id);
		};

		$scope.showHistory = function(mode){
			if(mode)
				Manual.history(mode, function(data){
					angular.copy(data.status, $scope.dataset.history);
					$scope.mode = 'history';
				});
			else
				$scope.mode = 'live';
		};

		//axis
		$scope.dataset = {
			live: Manual.statusHistory,
			history: []
		};

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
