var path = require('path'),
	winston = require('winston'),
	fork = require('child_process').fork,
	conf = require('./share/config.js'),
	logger = new winston.Logger({
		transports: [
			new winston.transports.File({
				name: 'file#normal',
				handleExceptions: false,
				json: false,
				maxsize: 1024000,
				maxFiles: 2,
				prettyPrint: false,
				filename: path.join(conf.runTemp, 'process.log')
			}),
			new winston.transports.File({
				name: 'file#critical',
				level: 'critical',
				handleExceptions: true,
				json: false,
				maxsize: 1,
				maxFiles: 1024,
				prettyPrint: true,
				filename: path.join(conf.runTemp, 'logs', 'process.log')
			}),
			new (winston.transports.Console)()
		],
		exitOnError: true
	}),
	workers = [
		{
			name: 'deamon',
			path: path.join(__dirname, 'deamon/deamon.js'),
			level: 0,
			master: true
		},
		{
			name: 'manager',
			path: path.join(__dirname, 'manager/manager.js'),
			level: 1,
			master: false
		}/*,
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
		}*/
	];

function startWorker(worker){
	worker.fork = fork(worker.path, [worker.name, worker.level, worker.master? 'master' : 'slave'], { stdio: 'inherit' });
	return worker.fork;
}

function checkRAM(worker){
	if(worker.ram.rss>conf.memoryLimit){
		logger.log('error','Memory usage limit reached!', {child: worker.name});
		worker.fork.kill();
	}
}

function checkLogin(){
	var ready = workers.every(function(worker){
		return worker.login;
	});

	if(ready){
		workers.forEach(function(worker){
			worker.fork.send({
				type: 'ready'
			});
		});
	}
}

workers.forEach(function(worker){
	var child = startWorker(worker);

	child.on('exit', function(){
		worker.login = false;
		logger.log('warm', 'Worker is going to exit!', {child: worker.name});
		//startWorker(worker);
	});

	child.on('error', function(err){
		worker.login = false;
		logger.log('error', err.message);
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
				logger.log('error', 'Worker latency problem', {child: worker.name});
			}, conf.slavePing);
		}else{
			logger.log('error', 'Worker have problem with start!', {child: worker.name});
		}
	});
}, conf.pingResend);