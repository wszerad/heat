var _ = require('underscore'),
	modeler = require('backbone-modelschema'),
	schema = require('./schemes/event.js');

//Relations
require('./schedule.js');
require('./program.js');

module.exports = function(Bookshelf){
	var Model = modeler(Bookshelf, schema);

	var proto = {
		program: function(){
			return this.hasOne('Program', 'schedule_id');
		},
		schedule: function(){
			return this.belongsTo('Schedule', 'schedule_id');
		}
	};

	var statc = {};

	return Bookshelf.model('Event', Model.extend(proto, statc));
};

