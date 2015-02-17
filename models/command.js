var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/command.js');

module.exports = function(Bookshelf){
	var Model = modeler(Bookshelf, schema);

	var proto = {};

	var statc = {};

	return Bookshelf.model('Command', Model.extend(proto, statc));
};