var event = require('./schemes/event.js'),
	status = require('./schemes/status.js'),
	command = require('./schemes/command.js'),
	schedule = require('./schemes/schedule.js'),
	control = require('./schemes/control.js'),
	program = require('./schemes/program.js');

angular.module('models', ['ngModel'])
	.factory('status-model', ['$model', function($model){
		return $model(status.attributes);
	}])
	.factory('command-model', ['$model', function($model){
		return $model(command.attributes);
	}])
	.factory('control-model', ['$model', function($model){
		return $model(control.attributes);
	}])
	.factory('event-model', ['$model', function($model){
		return $model(event.attributes);
	}])
	.factory('program-model', ['$model', function($model){
		return $model(program.attributes);
	}])
	.factory('schedule-model', ['$model', function($model){
		return $model(schedule.attributes);
	}]);