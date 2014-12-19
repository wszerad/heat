var path = require('path'),
	knex = require('knex'),
	db = knex({
		client: 'sqlite3',
		connection: {
			filename: conf.dbFilePath
		}
	});

var conf = {
	db: db,
	dbLogT: 'logs',
	dbComT: 'commands',
	dbProT: 'programs',
	dbSchT: 'schedule',
	dbStatsT: 'stats',
	runTemp: path.join(__dirname, 'tmp'),
	dbFilePath: path.join(__dirname, 'tmp', 'db.sqlite'),
	socketPort: 8000,
	slavePing: 200,
	pingResend: 1000,
	memoryLimit: 30*1000000,
	unitsNames: [],
	sensorsNames: [],
	install: function(cb){
		var indb = require('./programs.js');
		indb.programs.register(function(err) {
			indb.programs.insertBasic(function (err) {
				indb.schedule.register(function (err) {
					indb.schedule.insertBasic(function (err) {
					});
				});
			});
		});

		logs.schema(function(err){});
	}
};

module.exports = conf;