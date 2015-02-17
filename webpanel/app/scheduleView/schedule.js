angular.module('schedule', ['models', 'scheduleService', 'programService'])
	.controller('ScheduleCtrl', ['$scope', 'schedule-model', 'scheduleServ', 'ProgramFactory', 'days', 'range', function($scope, model, scheduleServ, programFactory, days, range) {
		var eventPrevious;
		$scope.eventForEvery = false;
		$scope.event = false;
		$scope.range = range;

		$scope.schedule = {};
		$scope.scheduleEvents = [];
		$scope.schedules = [];

		$scope.days = days();
		$scope.programs = [];

		$scope.current = {
			schedule: null,
			event: null
		};

		$scope.init = function(){
			scheduleServ.load(function(){
				$scope.schedules = scheduleServ.list;
			});

			programFactory.load(function(){
				$scope.programs = programFactory.list;
			});
		};

		//schedule
		$scope.select = function(index){
			$scope.current.schedule = index;
			$scope.scheduleEvents = $scope.schedules[index].events;
			$scope.schedule = angular.copy($scope.schedules[index]);
		};

		$scope.save = function(){
			if($scope.schedule.name===''){
				//TODO error, no name
			}else if($scope.schedule.id){
				scheduleServ.update($scope.current, $scope.schedule);
			}else{
				scheduleServ.save($scope.schedule, function(){
					$scope.current.schedule = $scope.schedules.length-1;
				});
			}
		};

		$scope.remove = function(){
			scheduleServ.remove($scope.current);
		};

		$scope.reset = function(){
			$scope.current.schedule = null;
			$scope.schedule = {};
			$scope.scheduleEvents = [];
		};

		//event
		$scope.selectEvent = function($event, id){
			$event.stopPropagation();

			scheduleServ.list[$scope.current.schedule].events.some(function(event, index){
				if(event.id === id){
					$scope.current.event = index;
					return true;
				}

				return false;
			});

			$scope.event = angular.copy(scheduleServ.list[$scope.current.schedule].events[$scope.current.event]);
		};

		$scope.saveEvent = function(){
			if($scope.event.name===''){
				//TODO error, no name
			}else if($scope.event.id){
				scheduleServ.reattach($scope.current, $scope.event, $scope.eventForEvery);
			}else{
				scheduleServ.attach($scope.current, $scope.event, $scope.eventForEvery);
			}
		};

		$scope.removeEvent = function(){
			scheduleServ.detach($scope.current, $scope.eventForEvery);
		};

		$scope.addEvent = function($event, day){
			var target = $($event.target),
				targetPosition = target.offset(),
				y = targetPosition.top;

			$scope.event = {
				start: Math.floor(($event.pageY-y)/target.height()*24*4)*15,
				day: day
			};
		};

		$scope.resetEvent = function(){
			$scope.current.event = null;
			$scope.event = false;
			$scope.eventForEvery = false;
		};
	}])
	.filter('numToTime', [function(){
		return function(number){
			return ('0'+number).substr(-2, 2)+':00'
		};
	}])
	.directive('appStart', [function(){
		var link = function(scope, element, attrs){
			var end = attrs.appEnd || 24*60,
				height = end-attrs.appStart;

			element.css('top', attrs.appStart/(24*60)*100+'%');
			element.css('height', height/(24*60)*100+'%');
		};

		return {
			restrict: 'A',
			link: link,
			transclude: true,
			template: '<div class="programTile" ng-transclude></div>'
		};
	}]);
