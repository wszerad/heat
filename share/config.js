var path = require('path');

var conf = {
	dbComT: 'commands',
	dbStatsT: 'stats',
	runTemp: path.join(__dirname, 'tmp'),
	socketPort: 8000,
	slavePing: 200,
	pingResend: 1000,
	memoryLimit: 10000000
};

module.exports = conf;