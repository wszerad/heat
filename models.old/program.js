var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/program.js'),
	defaults = {},
	base;

for(var i in schema.attributes){
	if('def' in schema.attributes[i])
		defaults[i] = schema.attributes[i].def;
}
	
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

var stat = {};

//var Promise  = require('bluebird');
var config = require('../share/config.js');

base = config.bookshelf;
stat = require('bookshelf-schemahelper')(base, schema);
_init = stat.init;

stat.init = function(cb){
	var self = this,
		keys = _.keys(defaults[_.keys(defaults)[0]]);

	_init(function(err){
		if(err)
			cb(err);
		else{
			var defs = base.Collection.extend({model: self}).forge();

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

var Model = modeler(base, schema);
module.exports = Model.extend(proto, stat);