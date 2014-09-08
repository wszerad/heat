var path = require('path'),
	fork = require('child_process').fork;

var port = 8000,
	timeout = 1000,
	runTemp = path.join(__dirname, 'temp');

var workers = [
	{
		name: 'manager',
		path: path.join(__dirname, 'manager/manager.js'),
		level: 1,
		master: false
	},
	{
		name: 'deamon',
		path: path.join(__dirname, 'deamon/deamon.js'),
		level: 0,
		master: true
	},
	{
		name: 'webpanel',
		path: path.join(__dirname, 'webpanel/webpanel.js'),
		level: 3,
		master: false
	},
	{
		name: 'lcdpanel',
		path: path.join(__dirname, 'lcdpanel/lcdpanel.js'),
		level: 2,
		master: false
	}
];

workers.forEach(function(worker){
	var worker = worker.fork = fork(worker.path, [worker.name, worker.level, worker.master? 'master' : 'slave', port, runTemp, timeout]);
});