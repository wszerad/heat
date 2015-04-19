var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/command.js'),
	commandLimit = 100;

module.exports = function(Bookshelf){
	var Model = modeler(Bookshelf, schema);

	var proto = {};

	var statc = {},
		_init = Model.init;

	statc.init = function(cb){
		var self = this;

		_init(function(err){
			if(err)
				cb(err);
			else{
				Bookshelf.knex.raw('CREATE TRIGGER command_limit AFTER INSERT ON command BEGIN DELETE FROM command WHERE time<(SELECT time FROM command ORDER BY time DESC LIMIT '+commandLimit+',1); END;').exec(cb);
			}
		});
	};

	return Bookshelf.model('Command', Model.extend(proto, statc));
};