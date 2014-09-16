var path = require('path'),
	winston = require('winston'),
	fork = require('child_process').fork,
	conf = require('./share/config.js'),
	logger = new winston.Logger({
		transports: [
			new winston.transports.File({
				handleExceptions: true,
				json: true,
				maxsize: 1024000,
				maxFiles: 2,
				filename: path.join(conf.runTemp, 'process.log')
			})],
		exitOnError: false
	}),
	workers = [
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

function startWorker(worker){
	worker.fork = fork(worker.path, [worker.name, worker.level, worker.master? 'master' : 'slave']);
	return worker.fork;
}

function checkRAM(worker){
	if(worker.ram.rss>conf.memoryLimit){
		logger.log('error', new Error('Memory usage limit reached!'));
		worker.fork.kill();
	}
}

function checkLogin(){
	var ready = workers.every(function(worker){
		return worker.login;
	});

	if(ready){
		workers.some(function(worker){
			if(worker.master){
				worker.fork.send({
					type: 'ready'
				});

				return true;
			}
			return false;
		});
	}
}

workers.forEach(function(worker){
	var child = startWorker(worker);

	child.on('exit', function(){
		logger.log('error', new Error('Worker '+worker.name+' is going to exit!'));
		startWorker(worker);
	});

	child.on('error', function(err){
		logger.log('error', err);
		child.kill();
	});

	child.on('message', function(data){
		switch (data.type){
			case 'register':
				worker.login = true;
				checkLogin();
				break;
			case 'ping':
				worker.ram = data.ram;
				clearTimeout(worker.ping);
				checkRAM(worker);
				worker.ping = null;
				break;
		}
	});
});

setInterval(function(){
	workers.forEach(function(worker){
		if(worker.login){
			worker.fork.send({type: 'ping'});
			worker.ping = setTimeout(function(){
				worker.fork.kill();
				logger.log('error', new Error('Worker '+worker.name+' reaction time is to big, reset.'));
			}, conf.slavePing);
		}else{
			logger.log('error', new Error('Worker '+worker.name+' have problem with start!'));
		}
	});
}, conf.pingResend);