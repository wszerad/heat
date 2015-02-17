var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/control.js');

module.exports = function(Bookshelf){
	var Model = modeler(Bookshelf, schema);

	var proto = {};

	var statc = {};

	return Bookshelf.model('Control', Model.extend(proto, statc));
};

