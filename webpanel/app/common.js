angular.module('common', [])
	.factory('range', [function(){
		return function(n){
			return new Array(n);
		}
	}])
	.filter('firstToUpper', function(){
		return function(input){
			return input[0].toLocaleUpperCase()+input.slice(1);
		};
	})
	.filter('minTime', function(){
		return function(minutes){
			return Math.floor(minutes/60) + ':' + ('00'+minutes%60).substr(-2);
		};
	})
	.filter('find', function(){
		return function(list, key, id){
			var i=0;
			while(i<list.length){
				if(key in list[i] && list[i][key]===id)
					return list[i];

				i++;
			}
		}
	})
	.directive('ngTime', function(){
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attr, ngModel) {
				ngModel.$parsers.push(function(text){
					var match = text.match(/(\d{1,2})\D{0,1}(\d{0,2})/);
					return match[1]*60+(match[2] || 0)*1;
				});
				ngModel.$formatters.push(function(minutes){
					return Math.floor(minutes/60) + ':' + ('00'+minutes%60).substr(-2);
				});
			}
		};
	})
	.directive('virtualNumber', function(){
		return {
			restrict: 'A',
			require: 'ngModel',
			link: function(scope, element, attrs, model){
				model.$parsers.push(function(text){
					return text*1;
				});
			}
		};
	})
	.directive('rangeList', function () {
		return {
			restrict: 'A',
			scope: {
				value: '=ngModel',
				list: '='
			},
			require: 'ngModel',
			link: function(scope, element, attrs, model) {
				var list = scope.list;

				element.attr('min', 0);
				element.attr('max', list.length-1);
				element.attr('step', 1);

				model.$parsers.push(function(text){
					return scope.list[text]*1;
				});

				model.$formatters.push(function(minutes){
					var index = scope.list.indexOf(minutes*1);

					if(index<0)
						index = 0;

					return index;
				});
			}
		};
	})
	.factory('days', [function(){
		return function(){
			var days = [
				{
					name: 'niedziela',
					day: 0
				},
				{
					name: 'poniedziałek',
					day: 1
				},
				{
					name: 'wtorek',
					day: 2
				},
				{
					name: 'środa',
					day: 3
				},
				{
					name: 'czwartek',
					day: 4
				},
				{
					name: 'piątek',
					day: 5
				},
				{
					name: 'sobota',
					day: 6
				}
			];

			return days;
		}
	}]);