(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./schemes/command.js":2,"./schemes/event.js":3,"./schemes/logs.js":4,"./schemes/program.js":5,"./schemes/schedule.js":6,"./schemes/status.js":7}],2:[function(require,module,exports){
module.exports = {
	tableName: 'command',
	attributes: {
		id: {
			text: 'ID',
			type: 'string',
			category: 'none'
		},
		owner: {
			text: 'moduł',
			type: 'string',
			category: 'none'
		},
		level: {
			text: 'poziom',
			type: 'integer',
			category: 'none'
		},
		turbineSpeed: {
			text: 'prędkosc turbiny',
			type: 'enum',
			enum: [0, 20, 40, 60, 80, 100],
			category: 'nawiew',
			show: true,
			default: 40,
			isParameter: true,
			PWM: true,
			pin: [6,5,4,2,1,7]
		},
		coWork: {
			text: 'pompa CO',
			type: 'boolean',
			category: 'CO',
			show: true,
			default: false,
			isParameter: true,
			pin: 9
		},
		cwuWork: {
			text: 'pompa CWU',
			type: 'boolean',
			category: 'CWU',
			show: true,
			default: false,
			isParameter: true,
			pin: 11
		},
		cwuCycleWork: {
			text: 'pompa obiegu CWU',
			type: 'boolean',
			category: 'CWU',
			show: true,
			default: false,
			isParameter: true,
			pin: 8
		},
		cycWork: {
			text: 'pompa cyrkulacyjna',
			type: 'boolean',
			category: 'Obieg',
			show: true,
			default: false,
			isParameter: true,
			pin: 10
		},
		turbineWork: {
			text: 'nawiew',
			type: 'boolean',
			category: 'nawiew',
			show: true,
			default: false,
			isParameter: true,
			pin: 12
		},
		helixWork: {
			text: 'podajnik',
			type: 'boolean',
			category: 'podajnik',
			show: true,
			default: false,
			isParameter: true,
			pin: 13
		},
		alert: {
			text: 'alarm',
			type: 'boolean',
			category: 'none',
			isParameter: true,
			pin: 0
		},
		m: {
			text: 'minute',
			type: 'integer',
			category: 'none'
		},
		time: {
			text: 'data',
			type: 'timestamp',
			category: 'none'
		}
	}
};
},{}],3:[function(require,module,exports){
module.exports = {
	tableName: 'events',
	attributes: {
		id: {
			text: 'ID', type: 'increments', default: null
		},
		schedule_id: {
			type: 'integer',
			notNull: true
		},
		program_id: {
			type: 'integer',
			notNull: true
		},
		start: {
			type: 'integer',
			notNull: true
		},
		day: {
			type: 'integer',
			notNull: true
		}
	}
};
},{}],4:[function(require,module,exports){
module.exports = {
	tableName: 'logs',
	attributes: {
		label: {
			text: 'etykieta', type: 'string', default: ''
		},
		level: {
			text: 'poziom', type: 'string', default: ''
		},
		message: {
			text: 'wiadomosc', type: 'string', default: ''
		},
		meta: {
			text: 'meta', type: 'string', default: 0
		},
		timestamp: {
			text: 'czas', type: 'timestamp', default: function(){
				return new Date();
			}
		}
	}
};
},{}],5:[function(require,module,exports){
module.exports = {
	tableName: 'programs',
	attributes: {
		id: {
			text: 'ID', type: 'increments', editable: false, category: 'Podstawowe', default: null
		},
		name: {
			text: 'nazwa', type: 'string', unique: true, category: 'Podstawowe', default: '', editable: true
		},
		basic: {
			text: 'podstawowy', type: 'boolean', editable: false, category: 'Podstawowe', default: false
		},
		insideTemp: {
			text: 'temp. wewnętrzna', type: 'integer', step: 1, min: 0, max: 26, category: 'Temperatura', default: 0, editable: true, isParameter: true
		},
		cycTemp: {
			text: 'temp. kotła', type: 'integer', step: 1, min: 0, max: 90, category: 'Temperatura', default: 0, editable: true, isParameter: true
		},
		coTemp: {
			text: 'temp. CO', type: 'integer', step: 1, min: 0, max: 90, category: 'Temperatura', default: 0, editable: true, isParameter: true
		},
		cwuTemp: {
			text: 'temp. CWU', type: 'integer', step: 1, min: 0, max: 90, category: 'Temperatura', default: 0, editable: true, isParameter: true
		},
		helixWork: {
			text: 'czas podawania', type: 'integer', step: 1, min: 0, max: 240, category: 'Podajnik', default: 0, editable: true, isParameter: true
		},
		helixStop: {
			text: 'przerwa podawania', type: 'integer', step: 1, min: 0, max: 240, category: 'Podajnik', default: 0, editable: true, isParameter: true
		},
		helixOffStop: {
			text: 'przerwa podtrzymania', type: 'integer', step: 1, min: 0, max: 240, category: 'Podajnik', default: 0, editable: true, isParameter: true
		},
		turbineWork: {
			text: 'turbina', type: 'boolean', category: 'Nawiew', default: true, editable: true, isParameter: true
		},
		turbineSpeed: {
			text: 'prędkosc turbiny', type: 'enum', enum: [20, 40, 60, 80, 100], category: 'Nawiew', default: 20, editable: true, isParameter: true
		},
		cycWork: {
			text: 'czas pompy', type: 'integer', step: 1, min: 0, max: 240, category: 'Cyrkulacja', default: 0, editable: true, isParameter: true
		},
		cycStop: {
			text: 'przerwa pompy', type: 'integer', step: 1, min: 0, max: 240, category: 'Cyrkulacja', default: 0, editable: true, isParameter: true
		},
		coWork: {
			text: 'czas pompy', type: 'integer', step: 1, min: 0, max: 240, category: 'CO', default: 0, editable: true, isParameter: true
		},
		coStop: {
			text: 'przerwa pompy', type: 'integer', step: 1, min: 0, max: 240, category: 'CO', default: 0, editable: true, isParameter: true
		},
		cwuWork: {
			text: 'czas pompy', type: 'integer', step: 1, min: 0, max: 240, category: 'CWU', default: 0, editable: true, isParameter: true
		},
		cwuStop: {
			text: 'przerwa pompy', type: 'integer', step: 1, min: 0, max: 240, category: 'CWU', default: 0, editable: true, isParameter: true
		},
		cwuCycleWork: {
			text: 'czas obiegu', type: 'integer', step: 1, min: 0, max: 240, category: 'CWU', default: 0, editable: true, isParameter: true
		},
		cwuCycleStop: {
			text: 'przerwa obiegu', type: 'integer', step: 1, min: 0, max: 240, category: 'CWU', default: 0, editable: true, isParameter: true
		}
	}
};
},{}],6:[function(require,module,exports){
module.exports = {
	tableName: 'schedules',
	attributes: {
		id: {
			text: 'ID', type: 'increments', default: null
		},
		name: {
			text: 'nazwa', type: 'string', unique: true, default: ''
		},
		basic: {
			text: 'podstawowy',
			type: 'boolean',
			default: false
		},
		active: {
			text: 'aktywny',
			type: 'boolean',
			default: false
		}
	}
};
},{}],7:[function(require,module,exports){
module.exports = {
	tableName: 'status',
	attributes: {
		coTemp: {
			text: 'temperatura CO',
			type: 'integer',
			category: 'CO',
			show: true,
			default: 0,
			pin: 5
		},
		cwuTemp: {
			text: 'temperatura CWU',
			type: 'integer',
			category: 'CWU',
			show: true,
			default: 0,
			pin: 6
		},
		cycTemp: {
			text: 'temperatura obiegowa',
			type: 'integer',
			category: 'obieg',
			show: true,
			default: 0,
			pin: 4
		},
		helixTemp: {
			text: 'temperatura podajnika',
			type: 'integer',
			category: 'podajnik',
			show: true,
			default: 0,
			pin: 3
		},
		insideTemp: {
			text: 'temperatura wewnetrzna',
			type: 'integer',
			category: 'inside',
			show: true,
			default: 0,
			pin: 7
		},
		m: {
			text: 'minute',
			type: 'integer',
			category: 'none'
		},
		time: {
			text: 'data',
			type: 'timestamp',
			category: 'none'
		},
		type: {
			text: 'typ',
			type: 'string',
			category: 'none'
		}
	}
};

},{}]},{},[1])