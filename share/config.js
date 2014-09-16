var path = require('path');

var conf = {
	dbComT: 'commands',
	dbStatsT: 'stats',
	runTemp: path.join(__dirname, 'tmp'),
	dbFilePath: path.join(__dirname, 'tmp', 'db.sqlite'),
	socketPort: 8000,
	slavePing: 200,
	pingResend: 1000,
	memoryLimit: 30*1000000,
	unitsNames: [],
	sensorsNames: []
};

module.exports = conf;