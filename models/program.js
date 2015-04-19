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
		var constructor = (this instanceof Model),
			self = this,
			predefined, name;

		if(constructor){
			names = obj;
			name = self.get('name');
		}else if(obj.name){
			name = obj.name;
		}

		if(name) {
			for(var i in statc.predefined){
				if(statc.predefined[i].name===name){
					predefined = statc.predefined[i];
					return true;
				}
			}
		}

		if(_.isArray(names))
			names = [].concat(names);
		else if(_.isFunction(names))
			names = self.getAttributes(names);
		else
			names = self.getAttributes();

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
					return model.save(null, {method: 'insert'}).then(function(){return 'ok';});
				}).exec(cb);
			}
		});
	};

	statc.list = function(name, cb){
		var self = this;

		if(!cb){
			cb = name;
			name = null;
		}

		if(!name)
			self.fetchAll().exec(function(err, res){
				if(err)
					return cb(err);

				cb(null, res.toJSON());
			});
		else
			self.where('name', name).fetch().exec(function(err, res){
				if(err)
					return cb(err);

				cb(null, res.toJSON());
			});
	};

	//statc.

	statc.predefined = {
		1: {id: 1, name: 'day', basic: 'true', insideTemp: 21, cycTemp: 60, coTemp: 0, helixWork: 20, helixStop: 20, helixOffStop: 60, turbineWork: true, turbineSpeed: 60, cycWork: 0, cycStop: 0, coWork: 30, coStop: 90, cwuWork: 15, cwuStop: 45},
		2: {id: 2, name: 'night', basic: 'true', insideTemp: 17, cycTemp: 60, coTemp: 0, helixWork: 20, helixStop: 20, helixOffStop: 60, turbineWork: true, turbineSpeed: 60, cycWork: 0, cycStop: 0, coWork: 30, coStop: 90, cwuWork: 15, cwuStop: 45},
		3: {id: 3, name: 'water', basic: 'true', insideTemp: 0, cycTemp: 60, coTemp: 0, helixWork: 20, helixStop: 20, helixOffStop: 60, turbineWork: true, turbineSpeed: 60, cycWork: 0, cycStop: 0, coWork: 0, coStop: 0, cwuWork: 15, cwuStop: 45},
		4: {id: 4, name: 'standby', basic: 'true', insideTemp: 0, cycTemp: 0, coTemp: 0, helixWork: 20, helixStop: 20, helixOffStop: 240, turbineWork: false, turbineSpeed: 0, cycWork: 0, cycStop: 0, coWork: 0, coStop: 0, cwuWork: 0, cwuStop: 0},
		5: {id: 5, name: 'stop', basic: 'true', insideTemp: 0, cycTemp: 0, coTemp: 0, helixWork: 0, helixStop: 0, helixOffStop: 0, turbineWork: false, turbineSpeed: 0, cycWork: 0, cycStop: 0, coWork: 0, coStop: 0, cwuWork: 0, cwuStop: 0}
	};

	_.extend(proto, both);
	_.extend(statc, both);
	return Bookshelf.model('Program', Model.extend(proto, statc));
};