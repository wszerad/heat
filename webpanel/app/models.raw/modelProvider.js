var event = require('./schemes/event.js'),
	status = require('./schemes/status.js'),
	command = require('./schemes/command.js'),
	logs = require('./schemes/logs.js'),
	schedule = require('./schemes/schedule.js'),
	program = require('./schemes/program.js');

angular.module('models', ['ngModel'])
	.factory('status-model', ['$model', function($model){
		return $model(status.attributes);
	}])
	.factory('command-model', ['$model', function($model){
		return $model(command.attributes);
	}])
	.factory('event-model', ['$model', function($model){
		return $model(event.attributes);
	}])
	.factory('program-model', ['$model', function($model){
		return $model(program.attributes);
	}])
	.factory('logs-model', ['$model', function($model){
		return $model(logs.attributes);
	}])
	.factory('schedule-model', ['$model', function($model){
		return $model(schedule.attributes);
	}]);