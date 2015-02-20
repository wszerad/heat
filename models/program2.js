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

	var proto = {
		isDefault: function(){
			var key = _.keys(defaults)[0];
			return (this.get('name') in defaults[key]);
		},
		toDefault: function(names){
			var self = this;
			if(!self.isDefault())
				return false;

			var id = self.get('name');

			if(names)
				names = [].concat(names);
			else
				names = _.keys(defaults);

			names.forEach(function(name){
				self.set(name, defaults[name][id]);
			});
		},
		events: function(){
			return this.belongsTo('Event', '');
		},
		schedules: function(){
			return this.belongsToMany('Schedule').through('Event');
		}
	};

	var statc = {},
		_init = Model.init;

	statc.init = function(cb){
		var self = this,
			keys = _.keys(defaults[_.keys(defaults)[0]]);

		_init(function(err){
			if(err)
				cb(err);
			else{
				var defs = Bookshelf.Collection.extend({model: self}).forge();

				keys.forEach(function(name){
					defs.add({name: name});
				});

				defs.mapThen(function(model){
					model.toDefault();
					console.log(model);
					return model.save().then(function(){return 'ok';});
				}).exec(cb);
			}
		});
	};

	return Bookshelf.model('Program', Model.extend(proto, statc));
};

