var path = require('path'),
	dbFilePath = path.join(__dirname, 'tmp', 'db.sqlite'),
	knex = require('knex')({
		client: 'sqlite3',
		connection: {
			filename: dbFilePath
		},
		debug: true
	}),
	Bookshelf = require('bookshelf')(knex);
	Bookshelf.plugin('registry');

//Models
var ProgramModel = require('../models/program.js')(Bookshelf),
	EventModel = require('../models/event.js')(Bookshelf),
	ScheduleModel = require('../models/schedule.js')(Bookshelf),
	CommandModel = require('../models/command.js')(Bookshelf),
	StatusModel = require('../models/status.js')(Bookshelf);

var conf = {
	db: knex,
	knex: knex,
	bookshelf: Bookshelf,
	//bookshelfmodels
	ProgramModel: ProgramModel,
	EventModel: EventModel,
	ScheduleModel: ScheduleModel,
	StatusModel: StatusModel,
	CommandModel: CommandModel,
	//knex hooks
	ProgramKnex: knex(ProgramModel.tableName),
	EventKnex:  knex(EventModel.tableName),
	ScheduleKnex:  knex(ScheduleModel.tableName),
	StatusKnex:  knex(StatusModel.tableName),
	CommandKnex:  knex(CommandModel.tableName),
	//names
	dbLogT: 'logs',
	dbComT: 'commands',
	dbProT: 'programs',
	dbSchT: 'schedule',
	dbStatsT: 'stats',
	runTemp: path.join(__dirname, 'tmp'),
	dbFilePath: dbFilePath,
	socketPort: 8000,
	slavePing: 200,
	pingResend: 1000,
	memoryLimit: 30*1000000,
	unitsNames: [],
	sensorsNames: []
};

module.exports = conf;