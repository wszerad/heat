var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/logs.js');

module.exports = function(Bookshelf){
	var Model = modeler(Bookshelf, schema);

	var proto = {};

	var statc = {};

	return Bookshelf.model('Logs', Model.extend(proto, statc));
};

