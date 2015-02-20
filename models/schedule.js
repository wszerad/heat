var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/schedule.js');

//Relations
require('./event.js');
require('./program.js');

module.exports = function(Bookshelf){
	var Model = modeler(Bookshelf, schema);

	var proto = {
		events: function() {
			return this.hasMany('Event', 'schedule_id');
		},
		programs: function(){
			return this.hasMany('Program').through('Event');
		}
	};

	var statc = {};

	return Bookshelf.model('Schedule', Model.extend(proto, statc));
};

