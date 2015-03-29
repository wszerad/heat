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
	ProgramKnex: knex(ProgramModel.tableName),
	EventKnex:  knex(EventModel.tableName),
	ScheduleKnex:  knex(ScheduleModel.tableName),
	CommandKnex:  knex(CommandModel.tableName),
	LogsKnex: knex(LogsModel.tableName),
	StatusKnex:  knex(StatusModel.tableName),
	//names
	runTemp: path.join(__dirname, 'tmp'),
	dbFilePath: dbFilePath,
	socketPort: 8001,
	webPort: 3000,
	unitTimeout: 4000,
	pwmTimeout: 30000,
	slavePing: 200,
	pingResend: 5000,
	memoryLimit: 60*1000000,
	unitsNames: [],
	sensorsNames: []
};

module.exports = conf;