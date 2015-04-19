var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/status.js');


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
				Bookshelf.knex.raw('CREATE TRIGGER status_limit AFTER INSERT ON status BEGIN DELETE FROM status WHERE timeout<(STRFTIME("%s", "now") * 1000); END;').exec(cb);
			}
		});
	};

	return Bookshelf.model('Status', Model.extend(proto, statc));
};