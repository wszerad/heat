var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/program.js'),
	defaults = {};

//Relations
require('./schedule.js');
require('./event.js');

for(var i in schema.attributes){
	if(i !== 'name')
		defaults[i] = schema.attributes[i].def;
}

module.exports = function(Bookshelf){
	var Model = modeler(Bookshelf, schema);

	var statc = {},
		proto = {},
		both = {},
		_init = Model.init;

	both.isPredefined = function(obj){
		var name = obj? obj.name : this.get('name');

		return statc.predefined.some(function(program){
			return program.name===name;
		});
	};

	both.toDefault = function(obj, names){
		var constructor = Object.hasOwnProperty('set'),
			self = this,
			predefined;

		if(constructor){
			names = obj;
		}

		if(_.isArray(names))
			names = [].concat(names);
		else if(_.isFunction(names))
			names = self.getAttributes(names);
		else
			names = self.getAttributes();

		statc.predefined.some(function(program){
			if(program.name===name){
				predefined = program;
				return true;
			}

			return false;
		});

		names.forEach(function(name){
			if(schema[name] && (predefined[name] || schema[name].default!==undefined)){
				if(!constructor){
					self.set(name, predefined[name] || schema[name].default);
				}else{
					obj[name] = predefined[name] || schema[name].default;
				}
			}
		});
	};

	proto.events = function(){
		return this.belongsTo('Event', '');
	};

	proto.schedules = function(){
		return this.belongsToMany('Schedule').through('Event');
	};

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
					model.toDefault();
					return model.save().then(function(){return 'ok';});
				}).exec(cb);
			}
		});
	};

	statc.predefined = {
		1: {id: 1, name: 'day', basic: 'true', insideTemp: 0, cycTemp: 0, coTemp: 0, helixWork: 0, helixStop: 0, helixOffStop: 0, turbineWork: true, turbineSpeed: 60, cycWork: 0, cycStop: 0, coWork: 0, coStop: 0, cwuWork: 0, cwuStop: 0},
		2: {id: 2, name: 'night', basic: 'true', insideTemp: 0, cycTemp: 0, coTemp: 0, helixWork: 0, helixStop: 0, helixOffStop: 0, turbineWork: true, turbineSpeed: 60, cycWork: 0, cycStop: 0, coWork: 0, coStop: 0, cwuWork: 0, cwuStop: 0},
		3: {id: 3, name: 'water', basic: 'true', insideTemp: 0, cycTemp: 0, coTemp: 0, helixWork: 0, helixStop: 0, helixOffStop: 0, turbineWork: true, turbineSpeed: 60, cycWork: 0, cycStop: 0, coWork: 0, coStop: 0, cwuWork: 0, cwuStop: 0},
		4: {id: 4, name: 'standby', basic: 'true', insideTemp: 0, cycTemp: 0, coTemp: 0, helixWork: 0, helixStop: 0, helixOffStop: 0, turbineWork: true, turbineSpeed: 60, cycWork: 0, cycStop: 0, coWork: 0, coStop: 0, cwuWork: 0, cwuStop: 0},
		5: {id: 5, name: 'stop', basic: 'true', insideTemp: 0, cycTemp: 0, coTemp: 0, helixWork: 0, helixStop: 0, helixOffStop: 0, turbineWork: true, turbineSpeed: 60, cycWork: 0, cycStop: 0, coWork: 0, coStop: 0, cwuWork: 0, cwuStop: 0}
	};

	_.extend(proto, both);
	_.extend(statc, both);
	return Bookshelf.model('Program', Model.extend(proto, statc));
};