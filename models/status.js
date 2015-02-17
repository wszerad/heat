var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/status.js');

module.exports = function(Bookshelf){
	var Model = modeler(Bookshelf, schema);

	var proto = {};

	var statc = {};

	return Bookshelf.model('Status', Model.extend(proto, statc));
};