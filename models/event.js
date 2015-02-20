var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/event.js');

//Relations
require('./schedule.js');
require('./program.js');

module.exports = function(Bookshelf){
	var Model = modeler(Bookshelf, schema),
		_init = Model.init;

	var proto = {
		program: function(){
			return this.hasOne('Program', 'schedule_id');
		},
		schedule: function(){
			return this.belongsTo('Schedule', 'schedule_id');
		}
	};

	var statc = {},
		id = 1;

	statc.init = function(cb){
		var self = this;

		_init(function(err){
			if(err)
				cb(err);
			else{
				var defs = Bookshelf.Collection.extend({model: self}).forge();

				for(var i in statc.predefined){
					defs.add(statc.predefined[i]);
				}

				defs.mapThen(function(model){
					return model.save(null, {method: 'insert'}).then(function(){return 'ok';});
				}).exec(cb);
			}
		});
	};

	statc.predefined = {};

	[{
		schedule_id: 1,
		program_id: 5,
		start: 0
	},{
		schedule_id: 2,
		program_id: 1,
		start: 0
	}].forEach(function(program){
		for(var i=0; i<7; i++){
			statc.predefined[id] = _.clone(program);
			statc.predefined[id].day = i;
			id++;
		}
	});

	return Bookshelf.model('Event', Model.extend(proto, statc));
};

