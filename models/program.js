var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/program.js'),
	defaults = {};

for(var i in schema.attributes){
	if(i !== 'id' && i !== 'name')
		defaults[i] = schema.attributes[i].def;
}

//Relations
require('./schedule.js');
require('./event.js');

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
					return model.save().then(function(){return 'ok';});
				}).exec(cb);
			}
		});
	};

	return Bookshelf.model('Program', Model.extend(proto, statc));
};