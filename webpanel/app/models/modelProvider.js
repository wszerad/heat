(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./schemes/command.js":2,"./schemes/control.js":3,"./schemes/event.js":4,"./schemes/program.js":5,"./schemes/schedule.js":6,"./schemes/status.js":7}],2:[function(require,module,exports){
module.exports = {
	tableName: 'command',
	attributes: {
		id: {
			text: 'ID',
			type: 'increments',
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
			enum: [30, 40, 50, 60, 70, 80, 90, 100],
			category: 'nawiew',
			show: true,
			default: 30
		},
		coWork: {
			text: 'pompa CO',
			type: 'boolean',
			category: 'CO',
			show: true,
			default: false
		},
		cwuWork: {
			text: 'pompa CWU',
			type: 'boolean',
			category: 'CWU',
			show: true,
			default: false
		},
		cycWork: {
			text: 'pompa cyrkulacyjna',
			type: 'boolean',
			category: 'Obieg',
			show: true,
			default: false
		},
		turbineWork: {
			text: 'nawiew',
			type: 'boolean',
			category: 'nawiew',
			show: true,
			default: false
		},
		helixWork: {
			text: 'podajnik',
			type: 'boolean',
			category: 'podajnik',
			show: true,
			default: false
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
	tableName: 'control',
	attributes: {
		turbinSpeed: {
			text: 'prędkosc turbiny',
			type: 'enum',
			enum: [30, 40, 50, 60, 70, 80, 90, 100],
			category: 'nawiew',
			default: 30
		},
		coWork: {
			text: 'pompa CO',
			type: 'boolean',
			category: 'CO',
			default: false
		},
		coTemp: {
			text: 'temperatura CO',
			type: 'integer',
			category: 'CO',
			default: 0
		},
		cwuWork: {
			text: 'pompa CWU',
			type: 'boolean',
			category: 'CWU',
			default: false
		},
		cwuTemp: {
			text: 'temperatura CWU',
			type: 'integer',
			category: 'CWU',
			default: 0
		},
		cycWork: {
			text: 'pompa cyrkulacyjna',
			type: 'boolean',
			category: 'Obieg',
			default: false
		},
		cycTemp: {
			text: 'temperatura obiegowa',
			type: 'integer',
			category: 'obieg',
			default: 0
		},
		turbineWork: {
			text: 'nawiew',
			type: 'boolean',
			category: 'nawiew',
			default: false
		},
		helixWork: {
			text: 'podajnik',
			type: 'boolean',
			category: 'podajnik',
			default: false
		},
		helixTemp: {
			text: 'temperatura podajnika',
			type: 'integer',
			category: 'podajnik',
			default: 0
		},
		fuseTemp: {
			text: 'temperatura topnika',
			type: 'integer',
			category: 'topnik',
			default: 0
		},
		inside: {
			text: 'temperatura wewnetrzna',
			type: 'integer',
			category: 'inside',
			default: 0
		}
	}
};

},{}],4:[function(require,module,exports){
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
			text: 'podstawowy', type: 'boolean', def: {
				day: true, night: true, water: true, standby: true, stop: true
			}, editable: false, category: 'Podstawowe', default: false
		},
		temp: {
			text: 'zadana', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 26, category: 'Temperatura', default: 0, editable: true
		}, cycTemp: {
			text: 'temp. kotła', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 90, category: 'Temperatura', default: 0, editable: true
		}, coTemp: {
			text: 'temp. CO', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 90, category: 'Temperatura', default: 0, editable: true
		}, helixWork: {
			text: 'czas podawania', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'Podajnik', default: 0, editable: true
		}, helixStop: {
			text: 'przerwa podawania', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'Podajnik', default: 0, editable: true
		}, helixOffStop: {
			text: 'przerwa podtrzymania', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'Podajnik', default: 0, editable: true
		}, turbineWork: {
			text: 'turbina', type: 'boolean', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, category: 'Nawiew', default: true, editable: true
		}, turbinSpeed: {
			text: 'prędkosc turbiny', type: 'enum', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, enum: [30, 40, 50, 60, 70, 80, 90, 100], category: 'Nawiew', default: 30, editable: true
		}, cycWork: {
			text: 'czas pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'Cyrkulacja', default: 0, editable: true
		}, cycStop: {
			text: 'przerwa pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'Cyrkulacja', default: 0, editable: true
		}, coWork: {
			text: 'czas pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'CO', default: 0, editable: true
		}, coStop: {
			text: 'przerwa pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'CO', default: 0, editable: true
		}, cwuWork: {
			text: 'czas pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'CWU', default: 0, editable: true
		}, cwuStop: {
			text: 'przerwa pompy', type: 'integer', def: {
				day: 0, night: 0, water: 0, standby: 0, stop: 0
			}, step: 1, min: 0, max: 240, category: 'CWU', default: 0, editable: true
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
			default: 0
		},
		cwuTemp: {
			text: 'temperatura CWU',
			type: 'integer',
			category: 'CWU',
			show: true,
			default: 0
		},
		cycTemp: {
			text: 'temperatura obiegowa',
			type: 'integer',
			category: 'obieg',
			show: true,
			default: 0
		},
		helixTemp: {
			text: 'temperatura podajnika',
			type: 'integer',
			category: 'podajnik',
			show: true,
			default: 0
		},
		fuseTemp: {
			text: 'temperatura topnika',
			type: 'integer',
			category: 'topnik',
			show: true,
			default: 0
		},
		insideTemp: {
			text: 'temperatura wewnetrzna',
			type: 'integer',
			category: 'inside',
			show: true,
			default: 0
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

},{}]},{},[1])