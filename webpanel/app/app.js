angular.module('app', ['ngRoute', 'main', 'program', 'schedule', 'debugger', 'angular.filter', 'common', 'frapontillo.bootstrap-switch'])
	.constant('pages', [
		{
			name: 'Kontrola',
			href: '/main',
			templateUrl: 'app/mainView/main.tpl.html',
			controller: 'ControlCtrl',
			defuault: true,
			active: true
		},
		{
			name: "Programy",
			href: '/program',
			templateUrl: 'app/programView/program.tpl.html',
			controller: 'ProgramCtrl'
		},
		{
			name: "Harmonogram",
			href: '/schedule',
			templateUrl: 'app/scheduleView/schedule.tpl.html',
			controller: 'ScheduleCtrl'
		},
		{
			name: "Logi",
			href: '/logs',
			templateUrl: 'app/debuggerView/debugger.tpl.html',
			controller: 'DebuggerCtrl'
		}
	])
	.config(['$routeProvider', 'pages', function ($routeProvider, pages){
		pages.forEach(function(page){
			$routeProvider.when(page.href, {
				templateUrl: page.templateUrl,
				controller: page.controller
			});

			if(page.defuault){
				$routeProvider.otherwise({
					redirectTo: page.href
				});
			}
		});
	}])
	.run(function(){
		//console.log('poszlo');
	})
	.controller('MainCtrl', ['$scope', 'pages', function($scope, pages){
		$scope.pages = pages;

		pages.some(function(page, index){
			if(page.active){
				$scope.current = pages[index];
				return true;
			}

			return false;
		});

		$scope.selectPage = function(index){
			$scope.current = pages[index];
		};
	}]);