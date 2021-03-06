var path = require('path'),
	dbFilePath = path.join(__dirname, 'tmp', 'db.sqlite'),
	knex = require('knex')({
		client: 'sqlite3',
		connection: {
			filename: dbFilePath
		}
	}),
	Bookshelf = require('bookshelf')(knex);
	Bookshelf.plugin('registry');

knex.client.acquireRawConnection()
.then(function(db){
    db.configure("busyTimeout", 2000);
});

//Models
var ProgramModel = require('../models/program.js')(Bookshelf),
	EventModel = require('../models/event.js')(Bookshelf),
	ScheduleModel = require('../models/schedule.js')(Bookshelf),
	CommandModel = require('../models/command.js')(Bookshelf),
	LogsModel = require('../models/logs.js')(Bookshelf),
	StatusModel = require('../models/status.js')(Bookshelf);

var conf = {
	db: knex,
	knex: knex,
	bookshelf: Bookshelf,
	//bookshelfmodels
	LogsModel: LogsModel,
	ProgramModel: ProgramModel,
	EventModel: EventModel,
	ScheduleModel: ScheduleModel,
	StatusModel: StatusModel,
	CommandModel: CommandModel,
	//knex hooks
	get ProgramKnex(){return knex(ProgramModel.tableName)},
	get EventKnex(){return knex(EventModel.tableName)},
	get ScheduleKnex(){return knex(ScheduleModel.tableName)},
	get CommandKnex(){return knex(CommandModel.tableName)},
	get LogsKnex(){return knex(LogsModel.tableName)},
	get StatusKnex(){return knex(StatusModel.tableName)},
	//names
	runTemp: path.join(__dirname, 'tmp'),
	dbFilePath: dbFilePath,
	socketPort: 8001,
	webPort: 1337,
	unitTimeout: 4000,
	pwmTimeout: 30000,
	slavePing: 500,
	pingResend: 5000,
	memoryLimit: 60*1000000,
	unitsNames: [],
	sensorsNames: []
};

module.exports = conf;