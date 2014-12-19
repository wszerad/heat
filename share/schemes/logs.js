var path = require('path'),
	conf = require(path.join(__dirname, '..', 'config.js')),
	knex = require('knex'),
	//prog = require('../../share/programs.js'),
	//programs = prog.programs,
	db = knex({
		client: 'sqlite3',
		connection: {
			filename: conf.dbFilePath
		}
	});

var logs = {
	schema: function(cb){
		db.schema.createTable(conf.dbLogT, function(table) {
			table.string('label');
			table.string('level');
			table.string('message');
			table.string('meta');
			table.timestamp('timestamp');
		}).
			exec(cb);
	}
};

module.exports = logs;