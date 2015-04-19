var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/logs.js'),
	logsLimit = 50;

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
				Bookshelf.knex.raw('CREATE TRIGGER logs_limit AFTER INSERT ON logs BEGIN DELETE FROM logs WHERE timestamp<(SELECT timestamp FROM logs ORDER BY timestamp DESC LIMIT '+logsLimit+',1); END;').exec(cb);
			}
		});
	};

	return Bookshelf.model('Logs', Model.extend(proto, statc));
};

